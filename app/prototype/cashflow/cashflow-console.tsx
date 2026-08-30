'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type CashflowItem = {
  id: string;
  kind: 'income' | 'bill' | 'planned_savings';
  name: string;
  amountCents: number;
  scheduledFor: string;
  confidence: 'scheduled' | 'estimated';
  recurring: boolean;
};

type Forecast = {
  source: 'memory' | 'supabase';
  asOf: string;
  currentBalanceCents: number;
  reserveCents: number;
  conservativeSpendableEstimateCents: number;
  horizons: Array<{
    days: 7 | 14 | 30;
    expectedIncomeCents: number;
    expectedBillsCents: number;
    plannedSavingsCents: number;
    projectedBalanceCents: number;
    spendableAfterReserveCents: number;
    status: 'comfortable' | 'tight' | 'shortfall';
  }>;
  upcoming: CashflowItem[];
  savingsGoals: Array<{
    id: string;
    name: string;
    targetCents: number;
    savedCents: number;
    targetDate: string | null;
  }>;
  assumptions: string[];
  disclosure: string;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function dollars(cents: number) {
  return money.format(cents / 100);
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function statusClasses(status: 'comfortable' | 'tight' | 'shortfall') {
  if (status === 'comfortable') return 'bg-emerald-50 text-emerald-700';
  if (status === 'tight') return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

export function CashflowConsole({ tenantKey, brandName }: { tenantKey: string; brandName: string }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [reserve, setReserve] = useState('500');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async (reserveValue = reserve) => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/prototype/cashflow?tenant=${encodeURIComponent(tenantKey)}&reserve=${encodeURIComponent(reserveValue)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Cash-flow forecast unavailable.');
      setForecast(data.forecast);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cash-flow forecast unavailable.');
    } finally {
      setBusy(false);
    }
  }, [reserve, tenantKey]);

  useEffect(() => {
    void load('500');
  }, [tenantKey]);

  const nextBill = useMemo(() => forecast?.upcoming.find((item) => item.kind === 'bill') || null, [forecast]);
  const nextIncome = useMemo(() => forecast?.upcoming.find((item) => item.kind === 'income') || null, [forecast]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-800">Cash-flow intelligence</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">Simulation only</span>
            </div>
            <h1 className="m-0 mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Know what you can afford before you spend.</h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">{brandName} combines your simulated balance, upcoming obligations, planned savings, and income into one conservative planning estimate.</p>
          </div>
          <div className="flex gap-2">
            <a href={`/prototype?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 no-underline shadow-sm">← Dashboard</a>
            <a href={`/prototype/operations?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl bg-[#0b153d] px-4 py-3 text-sm font-black text-white no-underline shadow-sm">Operations</a>
          </div>
        </header>

        {message ? <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{message}</div> : null}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <article className="overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#111b65_0%,#4f46e5_55%,#22d3ee_135%)] p-6 text-white shadow-xl sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Conservative spendable estimate</div>
            <div className="mt-2 text-[48px] font-black tracking-[-0.06em] sm:text-[64px]">{busy || !forecast ? '—' : dollars(forecast.conservativeSpendableEstimateCents)}</div>
            <p className="m-0 mt-2 max-w-xl text-sm leading-6 text-white/70">This keeps your reserve untouched and uses the lowest spendable result across the 7, 14, and 30-day views.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/12 px-3 py-2">Balance {forecast ? dollars(forecast.currentBalanceCents) : '—'}</span>
              <span className="rounded-full bg-white/12 px-3 py-2">Reserve {forecast ? dollars(forecast.reserveCents) : '—'}</span>
              <span className="rounded-full bg-white/12 px-3 py-2">{forecast?.source === 'supabase' ? 'Persistent demo' : 'Memory demo'}</span>
            </div>
          </article>

          <article className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Your reserve</div>
            <h2 className="m-0 mt-2 text-xl font-black">Protect a cushion first.</h2>
            <p className="m-0 mt-2 text-xs leading-5 text-slate-500">Change the simulated reserve and instantly recalculate. This does not move funds or create a real savings rule.</p>
            <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Reserve amount
              <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <span className="grid w-10 place-items-center text-sm text-slate-400">$</span>
                <input value={reserve} onChange={(event) => setReserve(event.target.value)} type="number" min="0" max="10000" step="25" className="min-w-0 flex-1 border-0 bg-transparent px-2 text-base font-black text-slate-950 outline-none" />
                <button type="button" onClick={() => void load()} disabled={busy} className="rounded-xl border-0 bg-indigo-600 px-4 text-xs font-black text-white disabled:opacity-50">{busy ? '...' : 'Update'}</button>
              </div>
            </label>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {(forecast?.horizons || []).map((horizon) => (
            <article key={horizon.days} className="rounded-[24px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{horizon.days}-day outlook</div>
                  <div className="mt-2 text-2xl font-black tracking-[-0.04em]">{dollars(horizon.projectedBalanceCents)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusClasses(horizon.status)}`}>{horizon.status}</span>
              </div>
              <div className="mt-5 grid gap-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Expected income</span><b className="text-emerald-700">+{dollars(horizon.expectedIncomeCents)}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Bills</span><b>−{dollars(horizon.expectedBillsCents)}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Planned savings</span><b>−{dollars(horizon.plannedSavingsCents)}</b></div>
                <div className="mt-2 flex justify-between border-t border-slate-100 pt-3"><span className="font-bold text-slate-500">After reserve</span><b>{dollars(horizon.spendableAfterReserveCents)}</b></div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div><h2 className="m-0 text-lg font-black tracking-[-0.03em]">What’s coming next</h2><p className="m-0 mt-1 text-xs text-slate-500">Scheduled and estimated synthetic cash-flow events.</p></div>
              <div className="text-right text-xs text-slate-400">Next bill<br /><b className="text-slate-700">{nextBill ? `${nextBill.name} · ${dollars(nextBill.amountCents)}` : '—'}</b></div>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {(forecast?.upcoming || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3.5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.kind === 'income' ? 'bg-emerald-50 text-emerald-700' : item.kind === 'planned_savings' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>{item.kind === 'income' ? '↓' : item.kind === 'planned_savings' ? '◇' : '↗'}</span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-sm">{item.name}</b><small className="mt-0.5 block text-slate-500">{shortDate(item.scheduledFor)} · {item.confidence}{item.recurring ? ' · recurring' : ''}</small></span>
                  <b className={`text-sm ${item.kind === 'income' ? 'text-emerald-700' : 'text-slate-950'}`}>{item.kind === 'income' ? '+' : '−'}{dollars(item.amountCents)}</b>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid content-start gap-5">
            <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Next income</div>
              <div className="mt-2 text-xl font-black">{nextIncome ? dollars(nextIncome.amountCents) : '—'}</div>
              <p className="m-0 mt-1 text-xs text-slate-500">{nextIncome ? `${nextIncome.name} · ${shortDate(nextIncome.scheduledFor)}` : 'No scheduled income in view.'}</p>
            </section>

            {(forecast?.savingsGoals || []).map((goal) => {
              const percent = Math.min(100, Math.round((goal.savedCents / goal.targetCents) * 100));
              return (
                <section key={goal.id} className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Savings goal</div>
                  <h2 className="m-0 mt-2 text-lg font-black">{goal.name}</h2>
                  <div className="mt-4 flex justify-between text-sm"><b>{dollars(goal.savedCents)}</b><span className="text-slate-500">of {dollars(goal.targetCents)}</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} /></div>
                  <div className="mt-2 text-xs text-slate-500">{percent}% funded{goal.targetDate ? ` · target ${shortDate(goal.targetDate)}` : ''}</div>
                </section>
              );
            })}
          </aside>
        </div>

        <section className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="m-0 text-base font-black text-amber-950">Why this number can change</h2>
          <ul className="mb-0 mt-3 grid gap-2 pl-5 text-xs leading-5 text-amber-900/80">
            {(forecast?.assumptions || []).map((assumption) => <li key={assumption}>{assumption}</li>)}
          </ul>
        </section>

        <footer className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
          <b className="text-slate-700">Planning boundary:</b> {forecast?.disclosure || 'Simulation-only cash-flow planning.'} Real banking products must use actual available balances, pending/posted transaction rules, partner data, customer permissions, and approved disclosures before launch.
        </footer>
      </div>
    </main>
  );
}
