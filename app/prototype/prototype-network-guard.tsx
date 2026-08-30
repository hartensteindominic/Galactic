'use client';

import { useEffect } from 'react';

const RETRY_KEY_TTL_MS = 2 * 60 * 1000;

type RetryKey = {
  idempotencyKey: string;
  expiresAt: number;
};

async function intentFingerprint(pathname: string, body: string) {
  const bytes = new TextEncoder().encode(`${pathname}\n${body}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

export function PrototypeNetworkGuard() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const inFlightTransfers = new Map<string, Promise<Response>>();
    const retryKeys = new Map<string, RetryKey>();

    function activeRetryKey(fingerprint: string) {
      const entry = retryKeys.get(fingerprint);
      if (!entry) return null;
      if (entry.expiresAt <= Date.now()) {
        retryKeys.delete(fingerprint);
        return null;
      }
      return entry.idempotencyKey;
    }

    const guardedFetch: typeof window.fetch = async (input, init) => {
      const requestUrl = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const pathname = new URL(requestUrl, window.location.href).pathname;

      if (method === 'POST' && pathname === '/api/prototype/transfers') {
        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        new Headers(init?.headers).forEach((value, key) => headers.set(key, value));

        const body = typeof init?.body === 'string' ? init.body : '';
        const fingerprint = body ? await intentFingerprint(pathname, body) : '';
        const explicitIdempotencyKey = headers.get('Idempotency-Key');
        const retryIdempotencyKey = !explicitIdempotencyKey && fingerprint ? activeRetryKey(fingerprint) : null;

        if (!headers.has('Idempotency-Key') && retryIdempotencyKey) {
          headers.set('Idempotency-Key', retryIdempotencyKey);
        }
        if (!headers.has('Idempotency-Key')) {
          headers.set('Idempotency-Key', crypto.randomUUID());
        }

        const idempotencyKey = headers.get('Idempotency-Key') || '';

        if (fingerprint) {
          const existing = inFlightTransfers.get(fingerprint);
          if (existing) {
            return (await existing).clone();
          }
        }

        const requestPromise = originalFetch(input, { ...init, headers })
          .then((response) => {
            if (fingerprint) {
              if (response.ok) {
                retryKeys.delete(fingerprint);
              } else if (response.status >= 500 || response.status === 408 || response.status === 429) {
                retryKeys.set(fingerprint, {
                  idempotencyKey,
                  expiresAt: Date.now() + RETRY_KEY_TTL_MS
                });
              } else {
                retryKeys.delete(fingerprint);
              }
            }
            return response;
          })
          .catch((error) => {
            if (fingerprint && idempotencyKey) {
              retryKeys.set(fingerprint, {
                idempotencyKey,
                expiresAt: Date.now() + RETRY_KEY_TTL_MS
              });
            }
            throw error;
          })
          .finally(() => {
            if (fingerprint) inFlightTransfers.delete(fingerprint);
          });

        if (fingerprint) inFlightTransfers.set(fingerprint, requestPromise);
        return (await requestPromise).clone();
      }

      return originalFetch(input, init);
    };

    window.fetch = guardedFetch;
    return () => {
      inFlightTransfers.clear();
      retryKeys.clear();
      if (window.fetch === guardedFetch) window.fetch = originalFetch;
    };
  }, []);

  return null;
}
