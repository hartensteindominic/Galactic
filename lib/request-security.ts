import { BankingError } from './banking';

export function requireJsonRequest(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new BankingError(415, 'JSON_REQUIRED', 'This endpoint only accepts JSON requests.');
  }
}

export async function readJsonBodyLimited<T>(request: Request, maxBytes = 16_384): Promise<T> {
  const text = await request.text();
  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength > maxBytes) {
    throw new BankingError(413, 'REQUEST_BODY_TOO_LARGE', `Request body exceeds the ${maxBytes}-byte limit.`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BankingError(400, 'INVALID_JSON', 'Request body must contain valid JSON.');
  }
}

export function requireTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return;

  let requestOrigin = '';
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    throw new BankingError(400, 'INVALID_REQUEST_URL', 'The request URL is invalid.');
  }

  if (origin !== requestOrigin) {
    throw new BankingError(403, 'UNTRUSTED_ORIGIN', 'Cross-site requests are not allowed.');
  }
}

export function safeClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const first = forwarded.split(',')[0]?.trim();
  return (first || 'unknown').slice(0, 80);
}
