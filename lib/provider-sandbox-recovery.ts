import { randomUUID } from 'node:crypto';
import { BankingError } from './banking';
import { getProviderSandboxBankingStore } from './banking-sandbox-database';
import {
  processClaimedProviderSandboxEvent,
  PROVIDER_EVENT_LEASE_MS,
  PROVIDER_EVENT_MAX_ATTEMPTS
} from './provider-sandbox-event-processor';

const RECOVERY_BATCH_LIMIT = 10;

export type ProviderSandboxRecoveryItem = {
  eventId: string;
  status: 'processed' | 'failed';
  attemptCount: number;
  failureCode: string | null;
};

function failureCode(error: unknown) {
  return error instanceof BankingError ? error.code : 'PROVIDER_EVENT_PROCESSING_FAILED';
}

export async function recoverProviderSandboxEvents(workerId: string) {
  const store = getProviderSandboxBankingStore();
  const items: ProviderSandboxRecoveryItem[] = [];

  for (let index = 0; index < RECOVERY_BATCH_LIMIT; index += 1) {
    const now = Date.now();
    const claimToken = `${workerId.slice(0, 80)}:${randomUUID()}`;
    const claimed = await store.transaction((tx) => tx.claimNextRecoverableEvent({
      environment: 'provider_sandbox',
      claimToken,
      claimedAt: new Date(now).toISOString(),
      staleBefore: new Date(now - PROVIDER_EVENT_LEASE_MS).toISOString(),
      maxAttempts: PROVIDER_EVENT_MAX_ATTEMPTS
    }));

    if (!claimed) break;

    try {
      await processClaimedProviderSandboxEvent(store, claimed);
      items.push({
        eventId: claimed.eventId,
        status: 'processed',
        attemptCount: claimed.attemptCount,
        failureCode: null
      });
    } catch (error) {
      items.push({
        eventId: claimed.eventId,
        status: 'failed',
        attemptCount: claimed.attemptCount,
        failureCode: failureCode(error)
      });
    }
  }

  return {
    environment: 'provider_sandbox' as const,
    batchLimit: RECOVERY_BATCH_LIMIT,
    claimedCount: items.length,
    processedCount: items.filter((item) => item.status === 'processed').length,
    failedCount: items.filter((item) => item.status === 'failed').length,
    drained: items.length < RECOVERY_BATCH_LIMIT,
    items
  };
}
