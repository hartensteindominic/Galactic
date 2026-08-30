'use client';

import { FormEvent, useEffect, useState } from 'react';
import { OperationsConsole } from './operations-console';

type SessionState = 'checking' | 'open-memory-demo' | 'authenticated' | 'login-required' | 'configuration-locked';

export function OperationsShell({ tenantKey, brandName }: { tenantKey: string; brandName: string }) {
  const [state, setState] = useState<SessionState>('checking');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function checkSession() {
    const response = await fetch('/api/prototype/operator/session', { cache: 'no-store' });
    const data = await response.json();
    if (response.ok && data?.mode === 'open-memory-demo') {
      setState('open-memory-demo');
      return;
    }
    if (response.ok && data?.authenticated) {
      setState('authenticated');
      return;
    }
    if (data?.error?.code === 'OPERATOR_ACCESS_NOT_CONFIGURED') {
      setState('configuration-locked');
      setMessage(data.error.message);
      return;
    }
    setState('login-required');
  }

  useEffect(() => {
    checkSession().catch(() => {
      setState('login-required');
      setMessage('Operator session could not be verified.');
    });
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/prototype/operator/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessSecret: secret })
      });
      const data = await response.json();
      setSecret('');
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Operator sign-in failed.');
      setState('authenticated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operator sign-in failed.');
      setState('login-required');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'authenticated' || state === 'open-memory-demo') {
    return <OperationsConsole tenantKey={tenantKey} brandName={brandName} />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-lg rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(30,41,59,.10)] sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Operations access</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">Simulation only</span>
        </div>
        <h1 className="m-0 mt-5 text-3xl font-black tracking-[-0.05em]">{brandName} operator console</h1>
        <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
          Persistent reconciliation, audit evidence, and provider-event visibility are restricted behind a server-side prototype operator session.
        </p>

        {state === 'checking' ? <p className="mt-6 text-sm font-semibold text-slate-600">Checking operator session…</p> : null}

        {state === 'configuration-locked' ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <b>Persistent operations are locked.</b>
            <div className="mt-1">{message || 'Configure the server-only prototype operator access secret privately before exposing persistent operational evidence.'}</div>
          </div>
        ) : null}

        {state === 'login-required' ? (
          <form onSubmit={signIn} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Prototype operator access secret
              <input
                type="password"
                autoComplete="current-password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                required
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none focus:border-indigo-400"
              />
            </label>
            <button type="submit" disabled={busy} className="h-12 rounded-2xl border-0 bg-indigo-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
              {busy ? 'Signing in…' : 'Open operations'}
            </button>
          </form>
        ) : null}

        {message && state === 'login-required' ? <div className="mt-4 text-sm font-semibold text-rose-700" role="status">{message}</div> : null}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          This is a prototype access control, not production workforce identity, phishing-resistant MFA, SSO, or privileged-access management. Production operator access remains a separate release gate.
        </div>

        <a href={`/prototype?tenant=${encodeURIComponent(tenantKey)}`} className="mt-5 inline-block text-sm font-black text-indigo-700 no-underline">← Back to banking demo</a>
      </div>
    </main>
  );
}
