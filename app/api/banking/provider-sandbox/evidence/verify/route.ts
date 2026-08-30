import { BankingError } from '../../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../../lib/banking-http';
import { verifyStoredProviderSandboxEvidence } from '../../../../../../lib/provider-sandbox-evidence';
import { requireSandboxOperator } from '../../../../../../lib/sandbox-operator-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_OPERATOR_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BankingError(415, 'JSON_REQUIRED', 'Provider sandbox evidence verification requires application/json.');
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_OPERATOR_BODY_BYTES) {
      throw new BankingError(413, 'REQUEST_TOO_LARGE', 'Provider sandbox evidence verification request is too large.');
    }

    requireSandboxOperator(request, rawBody);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new BankingError(400, 'INVALID_JSON', 'Provider sandbox evidence verification request is invalid JSON.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BankingError(400, 'INVALID_REQUEST', 'Provider sandbox evidence verification request is invalid.');
    }

    const body = parsed as Record<string, unknown>;
    const keys = Object.keys(body);
    if (keys.length !== 1 || keys[0] !== 'bundleId') {
      throw new BankingError(400, 'INVALID_REQUEST_FIELDS', 'Only bundleId is accepted.');
    }

    const verification = await verifyStoredProviderSandboxEvidence(
      typeof body.bundleId === 'string' ? body.bundleId : ''
    );
    return bankingJson({ ok: true, verification });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
