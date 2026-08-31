import { NextResponse } from 'next/server';
import { BankingError } from './banking';

export function bankingJson(data: unknown, status = 200, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set('Cache-Control', 'no-store, max-age=0');
  headers.set('Pragma', 'no-cache');

  return NextResponse.json(data, {
    status,
    headers
  });
}

function newErrorId() {
  return globalThis.crypto.randomUUID();
}

export function bankingErrorResponse(error: unknown) {
  const errorId = newErrorId();

  if (error instanceof BankingError) {
    return bankingJson({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        errorId
      }
    }, error.status, { 'X-Error-ID': errorId });
  }

  console.error('Unexpected banking API error', {
    errorId,
    name: error instanceof Error ? error.name : 'UnknownError'
  });

  return bankingJson({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Banking service is temporarily unavailable.',
      errorId
    }
  }, 500, { 'X-Error-ID': errorId });
}
