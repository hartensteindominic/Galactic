'use client';

import { useEffect } from 'react';

export function PrototypeNetworkGuard() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

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
        if (!headers.has('Idempotency-Key')) {
          headers.set('Idempotency-Key', crypto.randomUUID());
        }
        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    window.fetch = guardedFetch;
    return () => {
      if (window.fetch === guardedFetch) window.fetch = originalFetch;
    };
  }, []);

  return null;
}
