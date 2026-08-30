import { BankingError } from '../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { reconcileProviderSandboxAccount } from '../../../../../lib/provider-sandbox-operations';
import { requireSandboxOperator } from '../../../../../lib/sandbox-operator-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPERATOR_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BankingError(415, 'JSON_REQUIRED', 'Provider sandbox account reconciliation requires application/json.');
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_OPERATOR_BODY_BYTES) {
      throw new BankingError(413, 'REQUEST_TOO_LARGE', 'Provider sandbox account reconciliation request is too large.');
    }

    const operatorId = requireSandboxOperator(request, rawBody);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new BankingError(400, 'INVALID_JSON', 'Provider sandbox account reconciliation request is invalid JSON.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BankingError(400, 'INVALID_REQUEST', 'Provider sandbox account reconciliation request is invalid.');
    }

    const body = parsed as Record<string, unknown>;
    const keys = Object.keys(body);
    if (keys.length !== 1 || keys[0] !== 'accountResourceId') {
      throw new BankingError(400, 'INVALID_REQUEST_FIELDS', 'Only accountResourceId is accepted.');
    }

    const result = await reconcileProviderSandboxAccount({
      operatorId,
      accountResourceId: typeof body.accountResourceId === 'string' ? body.accountResourceId : ''
    });

    return bankingJson({ ok: true, result });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
