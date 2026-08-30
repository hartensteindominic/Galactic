import type { CanonicalBankingEvent } from './banking-provider-adapter';
import type { LedgerJournal, ReconciliationSnapshot } from './financial-ledger';

export type EventInboxRecord = {
  eventId: string;
  provider: string;
  environment: 'provider_sandbox' | 'production';
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
  environment: 'provider_sandbox' | 'production';
  providerResourceId: string;
  createdAt: string;
};

export type ReconciliationRecord = {
  id: string;
  provider: string;
  environment: 'provider_sandbox' | 'production';
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
  environment: 'provider_sandbox' | 'production';
  occurredAt: string;
  metadata: Record<string, string | number | boolean | null>;
};

/**
 * Durable persistence boundary required before a real provider sandbox adapter
 * may be considered certification-complete.
 *
 * Implementations must be database-backed and transaction-safe. In-memory
 * Maps/Sets are acceptable only for the synthetic zero-money demonstration and
 * must never be used as production dedupe, ledger, reconciliation, or audit
 * storage.
 */
export interface BankingPersistenceStore {
  /**
   * Atomically insert one provider event if it has never been seen.
   * The unique constraint must cover provider + environment + rawProviderEventId.
   */
  putEventIfAbsent(record: EventInboxRecord): Promise<{ inserted: boolean; record: EventInboxRecord }>;

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
  appendJournalIfAbsent(journal: LedgerJournal): Promise<{ inserted: boolean; journal: LedgerJournal }>;

  putProviderResourceLink(link: ProviderResourceLink): Promise<void>;
  getProviderResourceLink(input: {
    provider: string;
    environment: 'provider_sandbox' | 'production';
    galacticResourceType: ProviderResourceLink['galacticResourceType'];
    galacticResourceId: string;
  }): Promise<ProviderResourceLink | null>;

  saveReconciliation(record: ReconciliationRecord): Promise<void>;
  appendAuditEvent(event: BankingAuditEvent): Promise<void>;
}

export const PROVIDER_SANDBOX_DURABILITY_REQUIREMENTS = [
  'atomic_event_dedupe',
  'append_only_balanced_journal',
  'unique_event_to_journal_mapping',
  'provider_resource_mapping',
  'reconciliation_history',
  'audit_history',
  'transactional_processing',
  'backup_and_recovery_plan'
] as const;
