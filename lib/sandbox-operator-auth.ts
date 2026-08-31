import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { BankingError } from './banking';

function safeHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function allowedOperatorIds() {
  return new Set(
    (process.env.BANKING_SANDBOX_OPERATOR_IDS || '')
      .split(',')
      .map((value) => value.trim())
      .filter((value) => /^[A-Za-z0-9._:@-]{1,120}$/.test(value))
  );
}

export function sandboxOperatorAuthStatus() {
  const secret = process.env.BANKING_SANDBOX_OPERATOR_SECRET || '';
  const allowed = allowedOperatorIds();
  const secretConfigured = secret.length >= 32;
  const allowlistConfigured = allowed.size > 0;
  const configured = secretConfigured && allowlistConfigured;

  return {
    configured,
    secretConfigured,
    allowlistConfigured,
    allowedOperatorCount: allowed.size,
    secretExposed: false,
    operatorIdsExposed: false,
    disclosure: configured
      ? 'Provider-sandbox operator signing and the operator allowlist are configured.'
      : 'Provider-sandbox admin actions remain locked until both a 32+ character signing secret and an explicit operator-ID allowlist are configured.'
  };
}

export function requireSandboxOperator(request: Request, rawBody: string) {
  const secret = process.env.BANKING_SANDBOX_OPERATOR_SECRET || '';
  const allowed = allowedOperatorIds();
  if (secret.length < 32 || allowed.size === 0) {
    throw new BankingError(503, 'SANDBOX_OPERATOR_AUTH_NOT_CONFIGURED', 'Provider-sandbox operator authentication and allowlist are not configured.');
  }

  const operatorId = request.headers.get('x-galactic-sandbox-operator')?.trim() || '';
  const timestamp = request.headers.get('x-galactic-sandbox-operator-timestamp')?.trim() || '';
  const signature = request.headers.get('x-galactic-sandbox-operator-signature')?.trim() || '';
  if (!operatorId || !timestamp || !signature || !/^[A-Za-z0-9._:@-]{1,120}$/.test(operatorId)) {
    throw new BankingError(401, 'SANDBOX_OPERATOR_AUTH_REQUIRED', 'A valid signed provider-sandbox operator request is required.');
  }

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() - timestampNumber) > 5 * 60_000) {
    throw new BankingError(401, 'SANDBOX_OPERATOR_AUTH_EXPIRED', 'Provider-sandbox operator signature is invalid or expired.');
  }

  const url = new URL(request.url);
  const bodyHash = createHash('sha256').update(rawBody).digest('hex');
  const payload = `${operatorId}.${timestamp}.${request.method.toUpperCase()}.${url.pathname}.${bodyHash}`;
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const normalized = signature.replace(/^sha256=/i, '').trim();

  if (!safeHexEqual(normalized, expected)) {
    throw new BankingError(401, 'SANDBOX_OPERATOR_AUTH_INVALID', 'Provider-sandbox operator signature is invalid.');
  }

  if (!allowed.has(operatorId)) {
    throw new BankingError(403, 'SANDBOX_OPERATOR_NOT_ALLOWED', 'Provider-sandbox operator is not authorized for this environment.');
  }

  return operatorId;
}
