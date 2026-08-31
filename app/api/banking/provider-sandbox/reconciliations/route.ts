import { BankingError } from '../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { listOpenProviderSandboxReconciliations } from '../../../../../lib/provider-sandbox-operations';
import { requireSandboxOperator } from '../../../../../lib/sandbox-operator-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPERATOR_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BankingError(415, 'JSON_REQUIRED', 'Provider sandbox reconciliation listing requires application/json.');
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_OPERATOR_BODY_BYTES) {
      throw new BankingError(413, 'REQUEST_TOO_LARGE', 'Provider sandbox reconciliation request is too large.');
    }

    requireSandboxOperator(request, rawBody);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody || '{}');
    } catch {
      throw new BankingError(400, 'INVALID_JSON', 'Provider sandbox reconciliation request is invalid JSON.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed as Record<string, unknown>).length > 0) {
      throw new BankingError(400, 'RECONCILIATION_LIST_PARAMETERS_NOT_ALLOWED', 'Open reconciliation listing does not accept custom parameters.');
    }

    const reconciliations = await listOpenProviderSandboxReconciliations();
    return bankingJson({ ok: true, reconciliations, count: reconciliations.length });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
