import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { BankingError } from './banking';

function safeHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sandboxOperatorAuthStatus() {
  const secret = process.env.BANKING_SANDBOX_OPERATOR_SECRET || '';
  return {
    configured: secret.length >= 32,
    secretExposed: false,
    disclosure: secret.length >= 32
      ? 'Provider-sandbox operator signing is configured.'
      : 'Provider-sandbox writes remain locked until a 32+ character operator signing secret is configured.'
  };
}

export function requireSandboxOperator(request: Request, rawBody: string) {
  const secret = process.env.BANKING_SANDBOX_OPERATOR_SECRET || '';
  if (secret.length < 32) {
    throw new BankingError(503, 'SANDBOX_OPERATOR_AUTH_NOT_CONFIGURED', 'Provider-sandbox operator authentication is not configured.');
  }

  const operatorId = request.headers.get('x-galactic-sandbox-operator')?.trim() || '';
  const timestamp = request.headers.get('x-galactic-sandbox-operator-timestamp')?.trim() || '';
  const signature = request.headers.get('x-galactic-sandbox-operator-signature')?.trim() || '';
  if (!operatorId || !timestamp || !signature) {
    throw new BankingError(401, 'SANDBOX_OPERATOR_AUTH_REQUIRED', 'A signed provider-sandbox operator request is required.');
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

  return operatorId.slice(0, 120);
}
