'use client';

import { useCallback, useEffect, useState } from 'react';

type OperationsStatus = {
  databaseConfigured: boolean;
  databaseCredentialsConfigured: boolean;
  reconciliationMode: 'persistent' | 'memory';
  persistentSchemaVerified: false;
  persistentReconciliationVerified: false;
  reconciliationExerciseVerified: false;
  webhookSecretConfigured: boolean;
  webhookInboxEnvironmentConfigured: boolean;
  webhookInboxConfigured: false;
  webhookReplayExerciseVerified: false;
  doubleEntryAvailableInBuild: true;
  sanitizedAuditEvidenceAvailable: boolean;
  sanitizedAuditPersistenceVerified: false;
  operatorAuditEvidenceAvailable: boolean;
  operatorAuditPersistenceVerified: false;
  persistentReconciliationEvidencePresent?: boolean;
  sandboxProviderEventEvidencePresent?: boolean;
  sanitizedAuditEvidencePresent?: boolean;
  realProviderWebhooksEnabled: false;
  liveMoneyEnabled: false;
  disclosure: string;
};

type ReconciliationRow = {
  id: string;
  account_id: string;
  recorded_balance_cents: number;
  expected_balance_cents: number;
  delta_cents: number;
  status: 'balanced' | 'mismatch';
  checked_at: string;
};

type ProviderEvent = {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  status: 'received' | 'processed' | 'ignored' | 'failed';
  received_at: string;
  processed_at: string | null;
};

type AuditEvent = {
  id: string;
  actor_type: 'system' | 'demo_user' | 'operator' | 'provider';
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

type OperationsResponse = {
  status: OperationsStatus;
  latestReconciliations: ReconciliationRow[];
  providerEvents: ProviderEvent[];
  auditEvents: AuditEvent[];
};

type ReconciliationResult = {
  source: 'memory' | 'supabase';
  balanced_accounts: number;
  mismatched_accounts: number;
  status: 'balanced' | 'attention';
  message: string;
  accounts: Array<{
    account_id: string;
    label: string;
    recorded_balance_cents: number;
    expected_balance_cents: number;
    delta_cents: number;
    status: 'balanced' | 'mismatch';
  }>;
  double_entry: {
    mismatched_accounts: number;
    status: 'balanced' | 'attention';
    message: string;
    accounts: Array<{
      account_id: string;
      label: string;
      recorded_balance_cents: number;
      gl_balance_cents: number;
      delta_cents: number;
      status: 'balanced' | 'mismatch';
    }>;
  };
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function dollars(cents: number) {
  return money.format(cents / 100);
}

function time(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function entityReference(event: AuditEvent) {
  if (!event.entity_id) return event.entity_type;
  const shortId = event.entity_id.length > 16 ? `${event.entity_id.slice(0, 8)}…${event.entity_id.slice(-4)}` : event.entity_id;
  return `${event.entity_type} · ${shortId}`;
}

export function OperationsConsole({ tenantKey, brandName }: { tenantKey: string; brandName: string }) {
  const [operations, setOperations] = useState<OperationsResponse | null>(null);
  const [lastResult, setLastResult] = useState<ReconciliationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const response = await fetch(`/api/prototype/operations?tenant=${encodeURIComponent(tenantKey)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Operations status unavailable.');
    setOperations(data.operations);
  }, [tenantKey]);

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Operations status unavailable.'));
  }, [load]);

  async function reconcile() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/prototype/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantKey })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Reconciliation failed.');
      setLastResult(data.reconciliation);
      setMessage(data.reconciliation.message || 'Reconciliation completed.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reconciliation failed.');
    } finally {
      setBusy(false);
    }
  }

  const hasReconciliationEvidence = (operations?.latestReconciliations.length || 0) > 0;
  const latestMismatch = operations?.latestReconciliations.some((row) => row.status === 'mismatch') || false;
  const reconciliationLabel = latestMismatch ? 'Attention' : hasReconciliationEvidence ? 'Evidence present' : 'Not exercised';
  const reconciliationTone = latestMismatch ? 'text-amber-700' : hasReconciliationEvidence ? 'text-indigo-700' : 'text-slate-500';
  const hasWebhookEvidence = (operations?.providerEvents.length || 0) > 0;
  const webhookLabel = hasWebhookEvidence
    ? 'Evidence present'
    : operations?.status.webhookInboxEnvironmentConfigured
      ? 'Environment configured'
      : 'Not configured';
  const webhookTone = hasWebhookEvidence ? 'text-indigo-700' : operations?.status.webhookInboxEnvironmentConfigured ? 'text-slate-700' : 'text-amber-700';

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Operations lab</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">Simulation only</span>
            </div>
            <h1 className="m-0 mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{brandName} operations</h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">Reconciliation, provider-event visibility, and launch controls for the white-label prototype. Real banking rails remain off.</p>
          </div>
          <a href={`/prototype?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 no-underline shadow-sm">← Banking demo</a>
        </header>

        {message ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" role="status">{message}</div> : null}

        {operations?.status.databaseCredentialsConfigured && !operations.status.persistentSchemaVerified ? (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-900">
            <b>Environment configured ≠ persistent controls verified.</b> Supabase credentials are present, but migrations, schema history, reconciliation, audit persistence, and webhook replay behavior still require a real disposable/private database exercise.
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[22px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.07)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Ledger environment</div>
            <div className="mt-2 text-xl font-black">{operations?.status.databaseCredentialsConfigured ? 'Environment configured' : 'Memory demo'}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-slate-500">{operations?.status.databaseCredentialsConfigured ? 'Server-side Supabase credentials are present; persistent schema and behavior are not yet verified.' : 'No persistent operations environment is configured.'}</p>
          </article>
          <article className="rounded-[22px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.07)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Reconciliation</div>
            <div className={`mt-2 text-xl font-black ${reconciliationTone}`}>{reconciliationLabel}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-slate-500">{hasReconciliationEvidence ? 'Recent stored rows are visible; this is evidence, not a production-readiness certification.' : 'No persistent reconciliation rows have been observed in this console yet.'}</p>
          </article>
          <article className="rounded-[22px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.07)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Webhook inbox</div>
            <div className={`mt-2 text-xl font-black ${webhookTone}`}>{webhookLabel}</div>
            <p className="m-0 mt-2 text-xs leading-5 text-slate-500">Sandbox event persistence/replay must be exercised against the target database; production provider verification is separate.</p>
          </article>
          <article className="rounded-[22px] bg-[#0b153d] p-5 text-white shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200">Live rails</div>
            <div className="mt-2 text-xl font-black text-rose-200">Disabled</div>
            <p className="m-0 mt-2 text-xs leading-5 text-white/65">No ACH, wires, deposits, cards, or real provider writes are enabled here.</p>
          </article>
        </section>

        <section className="mt-5 rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="m-0 text-lg font-black tracking-[-0.03em]">Two-layer ledger reconciliation</h2>
              <p className="m-0 mt-1 text-xs text-slate-500">Layer 1 recomputes balances from posted transactions. Layer 2 compares the recorded balance to the append-only double-entry GL.</p>
            </div>
            <button type="button" onClick={reconcile} disabled={busy} className="rounded-2xl border-0 bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg disabled:opacity-50">{busy ? 'Checking…' : 'Run reconciliation'}</button>
          </div>

          {lastResult ? (
            <div className={`mt-5 rounded-2xl border p-4 ${lastResult.status === 'balanced' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="font-black">{lastResult.source === 'memory' ? 'Memory demo reconciliation completed' : lastResult.status === 'balanced' ? 'This reconciliation run balanced in both layers' : 'Reconciliation attention required'}</div>
              <div className="mt-1 text-xs text-slate-600">Transaction layer balanced: {lastResult.balanced_accounts} · Mismatched: {lastResult.mismatched_accounts} · Source: {lastResult.source}</div>

              <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black">Layer 1 · Transaction history → account balance</div>
                    <div className="mt-1 text-xs text-slate-500">Opening balance plus posted credits and debits must equal the recorded account balance.</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${lastResult.mismatched_accounts === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{lastResult.mismatched_accounts === 0 ? 'Balanced' : 'Attention'}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {lastResult.accounts.map((account) => (
                    <div key={account.account_id} className="grid gap-1 rounded-xl border border-slate-100 bg-white px-3 py-3 text-xs sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4">
                      <b>{account.label}</b>
                      <span className="text-slate-500">Recorded {dollars(account.recorded_balance_cents)}</span>
                      <span className="text-slate-500">Expected {dollars(account.expected_balance_cents)}</span>
                      <b className={account.status === 'balanced' ? 'text-emerald-700' : 'text-amber-700'}>{account.status === 'balanced' ? 'Balanced' : `Δ ${dollars(account.delta_cents)}`}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black">Layer 2 · Double-entry GL → account balance</div>
                    <div className="mt-1 text-xs text-slate-500">The mapped customer GL must independently sum to the same recorded account balance.</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${lastResult.double_entry.status === 'balanced' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{lastResult.double_entry.status === 'balanced' ? 'Balanced' : 'Attention'}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">{lastResult.double_entry.message}</div>
                <div className="mt-3 grid gap-2">
                  {lastResult.double_entry.accounts.map((account) => (
                    <div key={account.account_id} className="grid gap-1 rounded-xl border border-slate-100 bg-white px-3 py-3 text-xs sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4">
                      <b>{account.label}</b>
                      <span className="text-slate-500">Recorded {dollars(account.recorded_balance_cents)}</span>
                      <span className="text-slate-500">GL {dollars(account.gl_balance_cents)}</span>
                      <b className={account.status === 'balanced' ? 'text-emerald-700' : 'text-amber-700'}>{account.status === 'balanced' ? 'Balanced' : `Δ ${dollars(account.delta_cents)}`}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <h2 className="m-0 text-lg font-black tracking-[-0.03em]">Recent reconciliation evidence</h2>
            <p className="m-0 mt-1 text-xs text-slate-500">Stored rows are evidence of individual prototype checks, not certification that reconciliation is continuously operating.</p>
            <div className="mt-4 grid gap-2">
              {(operations?.latestReconciliations || []).length === 0 ? <p className="text-sm text-slate-500">No persistent runs observed yet.</p> : null}
              {(operations?.latestReconciliations || []).map((row) => (
                <div key={row.id} className="rounded-xl border border-slate-100 px-3 py-3 text-xs">
                  <div className="flex justify-between gap-3"><b className={row.status === 'balanced' ? 'text-emerald-700' : 'text-amber-700'}>{row.status}</b><span className="text-slate-400">{time(row.checked_at)}</span></div>
                  <div className="mt-1 text-slate-500">Recorded {dollars(row.recorded_balance_cents)} · Expected {dollars(row.expected_balance_cents)} · Δ {dollars(row.delta_cents)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <h2 className="m-0 text-lg font-black tracking-[-0.03em]">Sandbox provider events</h2>
            <p className="m-0 mt-1 text-xs text-slate-500">Exact event IDs are deduplicated and conflicting replays fail closed. Stored rows do not mean a production provider webhook integration exists.</p>
            <div className="mt-4 grid gap-2">
              {(operations?.providerEvents || []).length === 0 ? <p className="text-sm text-slate-500">No sandbox events recorded.</p> : null}
              {(operations?.providerEvents || []).map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-100 px-3 py-3 text-xs">
                  <div className="flex justify-between gap-3"><b>{event.event_type}</b><span className="text-slate-400">{time(event.received_at)}</span></div>
                  <div className="mt-1 truncate text-slate-500">{event.provider} · {event.provider_event_id} · {event.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="m-0 text-lg font-black tracking-[-0.03em]">Sanitized audit trail</h2>
                <p className="m-0 mt-1 text-xs text-slate-500">Actor/action/entity/time only. Raw metadata is deliberately not returned to this UI.</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${operations?.status.sanitizedAuditEvidencePresent ? 'bg-indigo-100 text-indigo-700' : operations?.status.databaseCredentialsConfigured ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500'}`}>{operations?.status.sanitizedAuditEvidencePresent ? 'Evidence present' : operations?.status.databaseCredentialsConfigured ? 'Env set' : 'No DB'}</span>
            </div>
            <div className="mt-4 grid gap-2">
              {(operations?.auditEvents || []).length === 0 ? <p className="text-sm text-slate-500">No persistent audit events observed yet.</p> : null}
              {(operations?.auditEvents || []).map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-100 px-3 py-3 text-xs">
                  <div className="flex justify-between gap-3"><b>{event.action}</b><span className="whitespace-nowrap text-slate-400">{time(event.created_at)}</span></div>
                  <div className="mt-1 text-slate-500">{event.actor_type} · {entityReference(event)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
          <b className="text-slate-700">Control boundary:</b> this console can display simulated reconciliation, provider-event, and audit evidence. Environment configuration, stored rows, a balanced individual run, or green CI do not by themselves prove continuous production operation or readiness. A production banking launch still requires approved partner contracts, exact provider webhook verification, customer authentication, KYC/AML, fraud controls, compliance procedures, reconciliation against partner statements, incident response, and approved disclosures.
        </footer>
      </div>
    </main>
  );
}