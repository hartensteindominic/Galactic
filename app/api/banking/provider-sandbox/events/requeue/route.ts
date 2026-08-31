import { BankingError } from '../../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../../lib/banking-http';
import { requeueTerminalProviderSandboxEvent } from '../../../../../../lib/provider-sandbox-operations';
import { requireSandboxOperator } from '../../../../../../lib/sandbox-operator-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPERATOR_BODY_BYTES = 32 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BankingError(415, 'JSON_REQUIRED', 'Terminal provider-event requeue requires application/json.');
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_OPERATOR_BODY_BYTES) {
      throw new BankingError(413, 'REQUEST_TOO_LARGE', 'Terminal provider-event requeue request is too large.');
    }

    const operatorId = requireSandboxOperator(request, rawBody);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new BankingError(400, 'INVALID_JSON', 'Terminal provider-event requeue request is invalid JSON.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BankingError(400, 'INVALID_REQUEST', 'Terminal provider-event requeue request is invalid.');
    }

    const body = parsed as Record<string, unknown>;
    const keys = Object.keys(body).sort();
    if (keys.length !== 2 || keys[0] !== 'eventId' || keys[1] !== 'reason') {
      throw new BankingError(400, 'INVALID_REQUEST_FIELDS', 'Only eventId and reason are accepted.');
    }

    const result = await requeueTerminalProviderSandboxEvent({
      operatorId,
      eventId: typeof body.eventId === 'string' ? body.eventId : '',
      reason: typeof body.reason === 'string' ? body.reason : ''
    });

    return bankingJson({ ok: true, result });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
