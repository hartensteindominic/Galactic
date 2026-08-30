import { BankingError } from '../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import {
  clearOperatorSessionCookie,
  createPrototypeOperatorSession,
  operatorSessionCookie,
  prototypeOperatorAccessStatus,
  requirePrototypeOperator
} from '../../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin, safeClientIp } from '../../../../../lib/request-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 6;

function requireBestEffortLoginRateLimit(request: Request) {
  const now = Date.now();
  const key = safeClientIp(request);
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (current.count >= MAX_ATTEMPTS) {
    throw new BankingError(429, 'OPERATOR_LOGIN_RATE_LIMITED', 'Too many operator login attempts. Try again shortly.');
  }
  current.count += 1;
}

export async function GET(request: Request) {
  try {
    const status = prototypeOperatorAccessStatus();
    if (!status.required) {
      return bankingJson({ ok: true, authenticated: false, mode: 'open-memory-demo', status });
    }
    const session = requirePrototypeOperator(request);
    return bankingJson({ ok: true, authenticated: session.authenticated, mode: session.mode, status });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    requireBestEffortLoginRateLimit(request);

    const body = await readJsonBodyLimited<{ accessSecret?: string }>(request, 4_096);
    const session = createPrototypeOperatorSession(body.accessSecret?.trim() || '');
    return bankingJson({
      ok: true,
      authenticated: true,
      expiresAt: session.expiresAt,
      disclosure: 'Prototype operator session only. This is not production workforce identity or MFA.'
    }, 200, { 'Set-Cookie': operatorSessionCookie(session.value, session.expiresAt) });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireTrustedOrigin(request);
    return bankingJson({ ok: true, authenticated: false }, 200, { 'Set-Cookie': clearOperatorSessionCookie() });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
