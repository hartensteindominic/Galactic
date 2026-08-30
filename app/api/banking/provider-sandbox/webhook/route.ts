import { BankingError } from '../../../../../lib/banking';
import { getProviderSandboxBankingStore } from '../../../../../lib/banking-sandbox-database';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { getGatewayBankingSandboxAdapter } from '../../../../../lib/gateway-banking-sandbox-adapter';
import { captureAndProcessProviderSandboxEvent } from '../../../../../lib/provider-sandbox-event-processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_WEBHOOK_BYTES = 256 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BankingError(415, 'JSON_REQUIRED', 'Provider sandbox webhook must use application/json.');
    }

    const declaredLength = Number(request.headers.get('content-length') || '0');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BYTES) {
      throw new BankingError(413, 'WEBHOOK_TOO_LARGE', 'Provider sandbox webhook exceeds the maximum accepted size.');
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BYTES) {
      throw new BankingError(413, 'WEBHOOK_TOO_LARGE', 'Provider sandbox webhook exceeds the maximum accepted size.');
    }

    const signature = request.headers.get('x-galactic-sandbox-signature') || '';
    const timestamp = request.headers.get('x-galactic-sandbox-timestamp') || '';
    const eventId = request.headers.get('x-galactic-sandbox-event-id') || undefined;
    if (!signature || !timestamp) {
      throw new BankingError(401, 'WEBHOOK_SIGNATURE_REQUIRED', 'Provider sandbox webhook signature and timestamp are required.');
    }

    const adapter = getGatewayBankingSandboxAdapter();
    const envelope = { rawBody, signature, timestamp, eventId };
    const verified = await adapter.verifyWebhook(envelope);
    if (!verified) {
      throw new BankingError(401, 'WEBHOOK_SIGNATURE_INVALID', 'Provider sandbox webhook signature is invalid or expired.');
    }

    const canonicalEvent = await adapter.normalizeWebhook(envelope);
    if (eventId && eventId !== canonicalEvent.rawProviderEventId) {
      throw new BankingError(400, 'WEBHOOK_EVENT_ID_MISMATCH', 'Provider sandbox event header does not match the signed body.');
    }

    const store = getProviderSandboxBankingStore();
    const result = await captureAndProcessProviderSandboxEvent(store, canonicalEvent);

    return bankingJson({
      ok: true,
      accepted: true,
      eventId: result.eventId,
      type: result.type,
      duplicate: result.duplicate,
      processed: result.processed,
      ledgerJournalId: result.ledgerJournalId,
      reconciliationId: result.reconciliationId
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
