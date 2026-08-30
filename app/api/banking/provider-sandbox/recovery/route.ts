import { BankingError } from '../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { recoverProviderSandboxEvents } from '../../../../../lib/provider-sandbox-recovery';
import { requireSandboxOperator } from '../../../../../lib/sandbox-operator-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPERATOR_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BankingError(415, 'JSON_REQUIRED', 'Provider sandbox recovery requires application/json.');
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_OPERATOR_BODY_BYTES) {
      throw new BankingError(413, 'REQUEST_TOO_LARGE', 'Provider sandbox recovery request is too large.');
    }

    const operatorId = requireSandboxOperator(request, rawBody);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody || '{}');
    } catch {
      throw new BankingError(400, 'INVALID_JSON', 'Provider sandbox recovery request is invalid JSON.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed as Record<string, unknown>).length > 0) {
      throw new BankingError(
        400,
        'RECOVERY_PARAMETERS_NOT_ALLOWED',
        'Provider sandbox recovery uses a fixed bounded batch and does not accept custom parameters.'
      );
    }

    const result = await recoverProviderSandboxEvents(operatorId);
    return bankingJson({ ok: true, result });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
