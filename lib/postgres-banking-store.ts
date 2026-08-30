import { BankingError } from './banking';
import type { CanonicalBankingEvent } from './banking-provider-adapter';
import type {
  BankingAuditEvent,
  BankingPersistenceOperations,
  BankingPersistenceStore,
  DurableBankingEnvironment,
  EventClaimInput,
  EventInboxRecord,
  JournalWrite,
  ProviderResourceLink,
  ReconciliationRecord
} from './banking-persistence-contract';
import { assertBalancedJournal, type LedgerJournal, type LedgerLine } from './financial-ledger';

type SqlRow = Record<string, unknown>;

export type PostgresQueryResult<T extends SqlRow = SqlRow> = {
  rows: T[];
  rowCount: number | null;
};

export interface PostgresExecutor {
  query<T extends SqlRow = SqlRow>(text: string, values?: readonly unknown[]): Promise<PostgresQueryResult<T>>;
}

export interface PostgresTransactionClient extends PostgresExecutor {
  release(): void;
}

export interface PostgresPoolLike extends PostgresExecutor {
  connect(): Promise<PostgresTransactionClient>;
}

const EVENT_COLUMNS = `event_id, provider, environment, raw_provider_event_id, canonical_event,
  received_at, processed_at, status, failure_code, processing_token,
  processing_started_at, attempt_count, next_attempt_at`;

function rowCount(result: PostgresQueryResult) {
  return result.rowCount ?? result.rows.length;
}

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return new Date(value).toISOString();
  throw new BankingError(500, 'DATABASE_TIMESTAMP_INVALID', 'A banking database timestamp is invalid.');
}

function jsonObject<T>(value: unknown): T {
  if (typeof value === 'string') return JSON.parse(value) as T;
  return value as T;
}

function requireClaimInput(input: EventClaimInput) {
  if (input.claimToken.trim().length < 8 || input.claimToken.length > 200) {
    throw new BankingError(500, 'EVENT_CLAIM_TOKEN_INVALID', 'Banking event processing claim token is invalid.');
  }
  if (!Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1 || input.maxAttempts > 100) {
    throw new BankingError(500, 'EVENT_MAX_ATTEMPTS_INVALID', 'Banking event maximum attempt count is invalid.');
  }
  if (!Number.isFinite(Date.parse(input.claimedAt)) || !Number.isFinite(Date.parse(input.staleBefore))) {
    throw new BankingError(500, 'EVENT_CLAIM_TIMESTAMP_INVALID', 'Banking event claim timestamps are invalid.');
  }
}

function canonicalEventFingerprint(event: CanonicalBankingEvent) {
  return JSON.stringify([
    event.eventId,
    event.provider,
    event.environment,
    event.type,
    event.resourceId,
    event.customerId,
    event.accountId ?? null,
    event.amountCents ?? null,
    event.occurredAt,
    event.rawProviderEventId
  ]);
}

function journalFingerprint(journal: LedgerJournal) {
  return JSON.stringify([
    journal.id,
    journal.eventId,
    journal.currency,
    journal.createdAt,
    journal.lines.map((line) => [
      line.id,
      line.journalId,
      line.eventId,
      line.account,
      line.debitCents,
      line.creditCents,
      line.description
    ])
  ]);
}

function mapEvent(row: SqlRow): EventInboxRecord {
  return {
    eventId: String(row.event_id),
    provider: String(row.provider),
    environment: String(row.environment) as DurableBankingEnvironment,
    rawProviderEventId: String(row.raw_provider_event_id),
    canonicalEvent: jsonObject<CanonicalBankingEvent>(row.canonical_event),
    receivedAt: iso(row.received_at),
    processedAt: row.processed_at ? iso(row.processed_at) : null,
    status: String(row.status) as EventInboxRecord['status'],
    failureCode: row.failure_code ? String(row.failure_code) : undefined,
    processingToken: row.processing_token ? String(row.processing_token) : null,
    processingStartedAt: row.processing_started_at ? iso(row.processing_started_at) : null,
    attemptCount: Number(row.attempt_count ?? 0),
    nextAttemptAt: row.next_attempt_at ? iso(row.next_attempt_at) : null
  };
}

function mapResourceLink(row: SqlRow): ProviderResourceLink {
  return {
    galacticResourceType: String(row.galactic_resource_type) as ProviderResourceLink['galacticResourceType'],
    galacticResourceId: String(row.galactic_resource_id),
    provider: String(row.provider),
    environment: String(row.environment) as DurableBankingEnvironment,
    providerResourceId: String(row.provider_resource_id),
    createdAt: iso(row.created_at)
  };
}

function mapLedgerLine(row: SqlRow): LedgerLine {
  return {
    id: String(row.line_id),
    journalId: String(row.journal_id),
    eventId: String(row.event_id),
    account: String(row.account) as LedgerLine['account'],
    debitCents: Number(row.debit_cents),
    creditCents: Number(row.credit_cents),
    description: String(row.description)
  };
}

async function loadJournalByEvent(executor: PostgresExecutor, eventId: string): Promise<LedgerJournal | null> {
  const journalResult = await executor.query(
    `SELECT journal_id, event_id, currency, occurred_at
       FROM banking_ledger_journals
      WHERE event_id = $1`,
    [eventId]
  );

  const journalRow = journalResult.rows[0];
  if (!journalRow) return null;

  const linesResult = await executor.query(
    `SELECT line_id, journal_id, event_id, account, debit_cents, credit_cents, description
       FROM banking_ledger_lines
      WHERE journal_id = $1
      ORDER BY line_id`,
    [String(journalRow.journal_id)]
  );

  const journal: LedgerJournal = {
    id: String(journalRow.journal_id),
    eventId: String(journalRow.event_id),
    currency: 'USD',
    createdAt: iso(journalRow.occurred_at),
    lines: linesResult.rows.map(mapLedgerLine)
  };

  assertBalancedJournal(journal);
  return journal;
}

class PostgresBankingOperations implements BankingPersistenceOperations {
  constructor(private readonly executor: PostgresExecutor) {}

  async putEventIfAbsent(record: EventInboxRecord) {
    const inserted = await this.executor.query(
      `INSERT INTO banking_provider_events (
         event_id, provider, environment, raw_provider_event_id, canonical_event,
         received_at, processed_at, status, failure_code, processing_token,
         processing_started_at, attempt_count, next_attempt_at
       ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (provider, environment, raw_provider_event_id) DO NOTHING
       RETURNING event_id`,
      [
        record.eventId,
        record.provider,
        record.environment,
        record.rawProviderEventId,
        JSON.stringify(record.canonicalEvent),
        record.receivedAt,
        record.processedAt,
        record.status,
        record.failureCode ?? null,
        record.processingToken,
        record.processingStartedAt,
        record.attemptCount,
        record.nextAttemptAt
      ]
    );

    if (rowCount(inserted) > 0) return { inserted: true, record };

    const existingResult = await this.executor.query(
      `SELECT ${EVENT_COLUMNS}
         FROM banking_provider_events
        WHERE provider = $1 AND environment = $2 AND raw_provider_event_id = $3`,
      [record.provider, record.environment, record.rawProviderEventId]
    );
    const existingRow = existingResult.rows[0];
    if (!existingRow) {
      throw new BankingError(500, 'EVENT_DEDUPE_LOOKUP_FAILED', 'Provider event dedupe could not load the existing event.');
    }

    const existing = mapEvent(existingRow);
    if (canonicalEventFingerprint(existing.canonicalEvent) !== canonicalEventFingerprint(record.canonicalEvent)) {
      throw new BankingError(409, 'PROVIDER_EVENT_CONFLICT', 'The provider reused an event identifier with different canonical event data.');
    }

    return { inserted: false, record: existing };
  }

  async getEvent(eventId: string) {
    const result = await this.executor.query(
      `SELECT ${EVENT_COLUMNS}
         FROM banking_provider_events
        WHERE event_id = $1`,
      [eventId]
    );
    return result.rows[0] ? mapEvent(result.rows[0]) : null;
  }

  async findProcessedEventByResource(input: {
    provider: string;
    environment: DurableBankingEnvironment;
    type: CanonicalBankingEvent['type'];
    resourceId: string;
  }) {
    const result = await this.executor.query(
      `SELECT ${EVENT_COLUMNS}
         FROM banking_provider_events
        WHERE provider = $1
          AND environment = $2
          AND status = 'processed'
          AND canonical_event ->> 'type' = $3
          AND canonical_event ->> 'resourceId' = $4
        ORDER BY processed_at DESC
        LIMIT 1`,
      [input.provider, input.environment, input.type, input.resourceId]
    );
    return result.rows[0] ? mapEvent(result.rows[0]) : null;
  }

  async claimEventForProcessing(input: EventClaimInput & { eventId: string }) {
    requireClaimInput(input);
    const result = await this.executor.query(
      `UPDATE banking_provider_events
          SET status = 'processing',
              processing_token = $2,
              processing_started_at = $3,
              attempt_count = attempt_count + 1,
              processed_at = NULL,
              failure_code = NULL,
              next_attempt_at = NULL,
              updated_at = now()
        WHERE event_id = $1
          AND attempt_count < $5
          AND (
            status = 'received'
            OR (status = 'failed' AND (next_attempt_at IS NULL OR next_attempt_at <= $3::timestamptz))
            OR (status = 'processing' AND processing_started_at <= $4::timestamptz)
          )
        RETURNING ${EVENT_COLUMNS}`,
      [input.eventId, input.claimToken, input.claimedAt, input.staleBefore, input.maxAttempts]
    );
    return result.rows[0] ? mapEvent(result.rows[0]) : null;
  }

  async claimNextRecoverableEvent(input: EventClaimInput & { environment: DurableBankingEnvironment }) {
    requireClaimInput(input);
    const result = await this.executor.query(
      `WITH candidate AS (
         SELECT event_id
           FROM banking_provider_events
          WHERE environment = $1
            AND attempt_count < $5
            AND (
              status = 'received'
              OR (status = 'failed' AND (next_attempt_at IS NULL OR next_attempt_at <= $3::timestamptz))
              OR (status = 'processing' AND processing_started_at <= $4::timestamptz)
            )
          ORDER BY received_at, event_id
          FOR UPDATE SKIP LOCKED
          LIMIT 1
       )
       UPDATE banking_provider_events AS event
          SET status = 'processing',
              processing_token = $2,
              processing_started_at = $3,
              attempt_count = event.attempt_count + 1,
              processed_at = NULL,
              failure_code = NULL,
              next_attempt_at = NULL,
              updated_at = now()
         FROM candidate
        WHERE event.event_id = candidate.event_id
        RETURNING ${EVENT_COLUMNS}`,
      [input.environment, input.claimToken, input.claimedAt, input.staleBefore, input.maxAttempts]
    );
    return result.rows[0] ? mapEvent(result.rows[0]) : null;
  }

  async markEventProcessed(input: { eventId: string; processingToken: string; processedAt: string }) {
    const result = await this.executor.query(
      `UPDATE banking_provider_events
          SET status = 'processed',
              processed_at = $3,
              failure_code = NULL,
              processing_token = NULL,
              processing_started_at = NULL,
              next_attempt_at = NULL,
              updated_at = now()
        WHERE event_id = $1 AND status = 'processing' AND processing_token = $2`,
      [input.eventId, input.processingToken, input.processedAt]
    );
    if (rowCount(result) > 0) return;

    const existing = await this.getEvent(input.eventId);
    if (existing?.status === 'processed') return;
    throw new BankingError(409, 'EVENT_PROCESSING_LEASE_LOST', 'Provider event processing lease is no longer owned by this worker.');
  }

  async markEventFailed(input: {
    eventId: string;
    processingToken: string;
    failureCode: string;
    processedAt: string;
    nextAttemptAt: string | null;
  }) {
    const code = input.failureCode.trim().slice(0, 120);
    if (!code) throw new BankingError(500, 'EVENT_FAILURE_CODE_REQUIRED', 'A failed provider event needs a failure code.');

    const result = await this.executor.query(
      `UPDATE banking_provider_events
          SET status = 'failed',
              processed_at = $4,
              failure_code = $3,
              processing_token = NULL,
              processing_started_at = NULL,
              next_attempt_at = $5,
              updated_at = now()
        WHERE event_id = $1 AND status = 'processing' AND processing_token = $2`,
      [input.eventId, input.processingToken, code, input.processedAt, input.nextAttemptAt]
    );
    if (rowCount(result) === 0) {
      throw new BankingError(409, 'EVENT_PROCESSING_LEASE_LOST', 'Failed provider event could not be recorded because the processing lease was lost.');
    }
  }

  async appendJournalIfAbsent(input: JournalWrite) {
    const { environment, journal } = input;
    assertBalancedJournal(journal);

    const inserted = await this.executor.query(
      `INSERT INTO banking_ledger_journals (journal_id, event_id, environment, currency, occurred_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING journal_id`,
      [journal.id, journal.eventId, environment, journal.currency, journal.createdAt]
    );

    if (rowCount(inserted) === 0) {
      const existing = await loadJournalByEvent(this.executor, journal.eventId);
      if (!existing) throw new BankingError(500, 'LEDGER_DEDUPE_LOOKUP_FAILED', 'Existing ledger journal could not be loaded.');
      if (journalFingerprint(existing) !== journalFingerprint(journal)) {
        throw new BankingError(409, 'LEDGER_EVENT_CONFLICT', 'A canonical event is already linked to a different ledger journal.');
      }
      return { inserted: false, journal: existing };
    }

    for (const line of journal.lines) {
      await this.executor.query(
        `INSERT INTO banking_ledger_lines (
           line_id, journal_id, event_id, account, debit_cents, credit_cents, description
         ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [line.id, line.journalId, line.eventId, line.account, line.debitCents, line.creditCents, line.description]
      );
    }

    return { inserted: true, journal };
  }

  async putProviderResourceLink(link: ProviderResourceLink) {
    const inserted = await this.executor.query(
      `INSERT INTO banking_provider_resource_links (
         galactic_resource_type, galactic_resource_id, provider, environment,
         provider_resource_id, created_at
       ) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (provider, environment, galactic_resource_type, galactic_resource_id) DO NOTHING
       RETURNING id`,
      [link.galacticResourceType, link.galacticResourceId, link.provider, link.environment, link.providerResourceId, link.createdAt]
    );
    if (rowCount(inserted) > 0) return;

    const existing = await this.getProviderResourceLink({
      provider: link.provider,
      environment: link.environment,
      galacticResourceType: link.galacticResourceType,
      galacticResourceId: link.galacticResourceId
    });
    if (!existing || existing.providerResourceId !== link.providerResourceId) {
      throw new BankingError(409, 'PROVIDER_RESOURCE_CONFLICT', 'A Galactic resource maps to a different provider resource.');
    }
  }

  async getProviderResourceLink(input: {
    provider: string;
    environment: DurableBankingEnvironment;
    galacticResourceType: ProviderResourceLink['galacticResourceType'];
    galacticResourceId: string;
  }) {
    const result = await this.executor.query(
      `SELECT galactic_resource_type, galactic_resource_id, provider, environment,
              provider_resource_id, created_at
         FROM banking_provider_resource_links
        WHERE provider = $1 AND environment = $2
          AND galactic_resource_type = $3 AND galactic_resource_id = $4`,
      [input.provider, input.environment, input.galacticResourceType, input.galacticResourceId]
    );
    return result.rows[0] ? mapResourceLink(result.rows[0]) : null;
  }

  async saveReconciliation(record: ReconciliationRecord) {
    await this.executor.query(
      `INSERT INTO banking_reconciliations (
         id, provider, environment, scope, resource_id, snapshot, status,
         created_at, resolved_at, resolution_note
       ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)`,
      [record.id, record.provider, record.environment, record.scope, record.resourceId, JSON.stringify(record.snapshot), record.status, record.createdAt, record.resolvedAt, record.resolutionNote ?? null]
    );
  }

  async resolveReconciliation(input: { id: string; resolvedAt: string; resolutionNote: string }) {
    const note = input.resolutionNote.trim();
    if (!note) throw new BankingError(400, 'RECONCILIATION_NOTE_REQUIRED', 'A reconciliation resolution note is required.');

    const result = await this.executor.query(
      `UPDATE banking_reconciliations
          SET resolved_at = $2, resolution_note = $3
        WHERE id = $1 AND status = 'discrepancy' AND resolved_at IS NULL`,
      [input.id, input.resolvedAt, note]
    );
    if (rowCount(result) === 0) {
      throw new BankingError(409, 'RECONCILIATION_NOT_OPEN', 'The reconciliation discrepancy is not open for resolution.');
    }
  }

  async appendAuditEvent(event: BankingAuditEvent) {
    await this.executor.query(
      `INSERT INTO banking_audit_events (
         id, actor_type, actor_id, action, resource_type, resource_id,
         environment, occurred_at, metadata
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
      [event.id, event.actorType, event.actorId, event.action, event.resourceType, event.resourceId, event.environment, event.occurredAt, JSON.stringify(event.metadata)]
    );
  }
}

export class PostgresBankingStore implements BankingPersistenceStore {
  private readonly operations: PostgresBankingOperations;

  constructor(private readonly pool: PostgresPoolLike) {
    this.operations = new PostgresBankingOperations(pool);
  }

  putEventIfAbsent(record: EventInboxRecord) { return this.operations.putEventIfAbsent(record); }
  getEvent(eventId: string) { return this.operations.getEvent(eventId); }
  findProcessedEventByResource(input: { provider: string; environment: DurableBankingEnvironment; type: CanonicalBankingEvent['type']; resourceId: string }) { return this.operations.findProcessedEventByResource(input); }
  claimEventForProcessing(input: EventClaimInput & { eventId: string }) { return this.operations.claimEventForProcessing(input); }
  claimNextRecoverableEvent(input: EventClaimInput & { environment: DurableBankingEnvironment }) { return this.operations.claimNextRecoverableEvent(input); }
  markEventProcessed(input: { eventId: string; processingToken: string; processedAt: string }) { return this.operations.markEventProcessed(input); }
  markEventFailed(input: { eventId: string; processingToken: string; failureCode: string; processedAt: string; nextAttemptAt: string | null }) { return this.operations.markEventFailed(input); }

  appendJournalIfAbsent(input: JournalWrite) {
    return this.transaction((tx) => tx.appendJournalIfAbsent(input));
  }

  putProviderResourceLink(link: ProviderResourceLink) { return this.operations.putProviderResourceLink(link); }
  getProviderResourceLink(input: { provider: string; environment: DurableBankingEnvironment; galacticResourceType: ProviderResourceLink['galacticResourceType']; galacticResourceId: string }) { return this.operations.getProviderResourceLink(input); }
  saveReconciliation(record: ReconciliationRecord) { return this.operations.saveReconciliation(record); }
  resolveReconciliation(input: { id: string; resolvedAt: string; resolutionNote: string }) { return this.operations.resolveReconciliation(input); }
  appendAuditEvent(event: BankingAuditEvent) { return this.operations.appendAuditEvent(event); }

  async transaction<T>(work: (tx: BankingPersistenceOperations) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const tx = new PostgresBankingOperations(client);
      const result = await work(tx);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the original banking failure. The driver/pool is responsible
        // for discarding a connection that cannot rollback cleanly.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
