import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { BankingError } from './banking';

const COOKIE_NAME = 'gt_prototype_operator';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function operatorSecret() {
  return process.env.PROTOTYPE_OPERATOR_ACCESS_SECRET?.trim() || '';
}

function persistentPrototypeConfigured() {
  const baseUrl = process.env.SUPABASE_URL?.trim() || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
  return Boolean(baseUrl && secretKey);
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function cookieValue(request: Request, name: string) {
  const raw = request.headers.get('cookie') || '';
  for (const pair of raw.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

export function prototypeOperatorAccessStatus() {
  const configured = Boolean(operatorSecret());
  const persistentConfigured = persistentPrototypeConfigured();
  return {
    configured,
    persistentConfigured,
    required: configured || persistentConfigured,
    failClosedIfPersistentWithoutSecret: true,
    sessionTtlHours: SESSION_TTL_MS / (60 * 60 * 1000)
  } as const;
}

export function createPrototypeOperatorSession(presentedSecret: string) {
  const configured = operatorSecret();
  if (!configured) {
    throw new BankingError(503, 'OPERATOR_ACCESS_NOT_CONFIGURED', 'Prototype operator access is not configured.');
  }
  if (!presentedSecret || !safeEqual(configured, presentedSecret)) {
    throw new BankingError(401, 'INVALID_OPERATOR_ACCESS', 'Operator access was not accepted.');
  }

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonce = randomBytes(18).toString('hex');
  const payload = `v1.${expiresAt}.${nonce}`;
  return {
    value: `${payload}.${sign(payload, configured)}`,
    expiresAt
  };
}

export function operatorSessionCookie(value: string, expiresAt: number) {
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function clearOperatorSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function requirePrototypeOperator(request: Request) {
  const configured = operatorSecret();
  const persistentConfigured = persistentPrototypeConfigured();

  if (!configured) {
    if (persistentConfigured) {
      throw new BankingError(
        503,
        'OPERATOR_ACCESS_NOT_CONFIGURED',
        'Persistent prototype operations are locked until server-side operator access is configured.'
      );
    }
    return { mode: 'open-memory-demo' as const, authenticated: false };
  }

  const token = cookieValue(request, COOKIE_NAME);
  const parts = token.split('.');
  if (parts.length !== 4) {
    throw new BankingError(401, 'OPERATOR_AUTH_REQUIRED', 'Operator authentication is required for the operations console.');
  }

  const [version, expiresRaw, nonce, signature] = parts;
  if (version !== 'v1' || !nonce || !signature) {
    throw new BankingError(401, 'INVALID_OPERATOR_SESSION', 'The operator session is invalid.');
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
    throw new BankingError(401, 'EXPIRED_OPERATOR_SESSION', 'The operator session has expired.');
  }

  const payload = `${version}.${expiresRaw}.${nonce}`;
  const expected = sign(payload, configured);
  if (!safeEqual(expected, signature)) {
    throw new BankingError(401, 'INVALID_OPERATOR_SESSION', 'The operator session is invalid.');
  }

  return { mode: 'authenticated' as const, authenticated: true, expiresAt };
}
