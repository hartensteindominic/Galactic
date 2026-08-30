import type { CanonicalBankingEvent } from './banking-provider-adapter';
import type { LedgerJournal, ReconciliationSnapshot } from './financial-ledger';

export type DurableBankingEnvironment = 'provider_sandbox' | 'production';

export type EventInboxRecord = {
  eventId: string;
  provider: string;
  environment: DurableBankingEnvironment;
  rawProviderEventId: string;
  canonicalEvent: CanonicalBankingEvent;
  receivedAt: string;
  processedAt: string | null;
  status: 'received' | 'processed' | 'failed';
  failureCode?: string;
};

export type ProviderResourceLink = {
  galacticResourceType: 'customer' | 'account' | 'transfer' | 'card';
  galacticResourceId: string;
  provider: string;
  environment: DurableBankingEnvironment;
  providerResourceId: string;
  createdAt: string;
};

export type ReconciliationRecord = {
  id: string;
  provider: string;
  environment: DurableBankingEnvironment;
  scope: 'transfer_event' | 'account_balance' | 'daily_program';
  resourceId: string;
  snapshot: ReconciliationSnapshot;
  status: 'matched' | 'discrepancy';
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote?: string;
};

export type BankingAuditEvent = {
  id: string;
  actorType: 'system' | 'customer' | 'admin' | 'provider';
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  environment: DurableBankingEnvironment;
  occurredAt: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type JournalWrite = {
  environment: DurableBankingEnvironment;
  journal: LedgerJournal;
};

/**
 * Database-backed operations used inside and outside a transaction.
 *
 * Implementations must preserve uniqueness and append-only semantics at the
 * database layer, not only in application memory.
 */
export interface BankingPersistenceOperations {
  /**
   * Atomically insert one provider event if it has never been seen.
   * The unique constraint must cover provider + environment + rawProviderEventId.
   */
  putEventIfAbsent(record: EventInboxRecord): Promise<{ inserted: boolean; record: EventInboxRecord }>;

  getEvent(eventId: string): Promise<EventInboxRecord | null>;

  markEventProcessed(input: {
    eventId: string;
    processedAt: string;
  }): Promise<void>;

  markEventFailed(input: {
    eventId: string;
    failureCode: string;
    processedAt: string;
  }): Promise<void>;

  /**
   * Append a balanced journal exactly once for the canonical event.
   * The implementation must reject duplicate journal IDs and duplicate event IDs.
   */
  appendJournalIfAbsent(input: JournalWrite): Promise<{ inserted: boolean; journal: LedgerJournal }>;

  putProviderResourceLink(link: ProviderResourceLink): Promise<void>;
  getProviderResourceLink(input: {
    provider: string;
    environment: DurableBankingEnvironment;
    galacticResourceType: ProviderResourceLink['galacticResourceType'];
    galacticResourceId: string;
  }): Promise<ProviderResourceLink | null>;

  saveReconciliation(record: ReconciliationRecord): Promise<void>;
  resolveReconciliation(input: {
    id: string;
    resolvedAt: string;
    resolutionNote: string;
  }): Promise<void>;

  appendAuditEvent(event: BankingAuditEvent): Promise<void>;
}

/**
 * Durable persistence boundary required before a real provider sandbox adapter
 * may be considered certification-complete.
 *
 * Implementations must be database-backed and transaction-safe. In-memory
 * Maps/Sets are acceptable only for the synthetic zero-money demonstration and
 * must never be used as production dedupe, ledger, reconciliation, or audit
 * storage.
 */
export interface BankingPersistenceStore extends BankingPersistenceOperations {
  transaction<T>(work: (tx: BankingPersistenceOperations) => Promise<T>): Promise<T>;
}

export const PROVIDER_SANDBOX_DURABILITY_REQUIREMENTS = [
  'atomic_event_dedupe',
  'append_only_balanced_journal',
  'unique_event_to_journal_mapping',
  'provider_resource_mapping',
  'reconciliation_history',
  'audit_history',
  'transactional_processing',
  'failed_event_recovery_path',
  'backup_and_recovery_plan'
] as const;
