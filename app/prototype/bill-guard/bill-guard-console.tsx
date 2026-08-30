'use client';

import { useCallback, useEffect, useState } from 'react';

type CashflowItem = {
  id: string;
  kind: 'income' | 'bill' | 'planned_savings';
  name: string;
  amountCents: number;
  scheduledFor: string;
  confidence: 'scheduled' | 'estimated';
  recurring: boolean;
};

type BillGuardHorizon = {
  days: 7 | 14 | 30;
  knownBillsCents: number;
  scheduledBillsCents: number;
  estimatedBillsCents: number;
  availableForBillsCents: number;
  uncoveredBillsCents: number;
  coveragePercent: number;
  cashAfterBillsSavingsAndReserveCents: number;
  status: 'covered' | 'tight' | 'shortfall';
};

type BillGuardPlan = {
  planningOnly: true;
  automaticBillPayEnabled: false;
  fundsReservedOrMoved: false;
  liveBillProviderConnected: false;
  tenantKey: string;
  asOf: string;
  nextBill: CashflowItem | null;
  knownBillsNext30DaysCents: number;
  scheduledBillsNext30DaysCents: number;
  estimatedBillsNext30DaysCents: number;
  estimatedBillCount: number;
  lowestCoveragePercent: number;
  allKnownBillsCoveredAcrossHorizons: boolean;
  horizons: BillGuardHorizon[];
  assumptions: string[];
  disclosure: string;
};

type Forecast = {
  currentBalanceCents: number;
  reserveCents: number;
  source: 'memory' | 'supabase';
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function dollars(cents: number) {
  return money.format(cents / 100);
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function statusStyle(status: BillGuardHorizon['status']) {
  if (status === 'covered') return 'bg-emerald-50 text-emerald-700';
  if (status === 'tight') return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function headline(plan: BillGuardPlan | null) {
  if (!plan) return 'Checking known bills…';
  if (plan.allKnownBillsCoveredAcrossHorizons) return 'Your known bills are covered in this plan.';
  return 'Your plan needs attention before upcoming bills.';
}

export function BillGuardConsole({ tenantKey, brandName }: { tenantKey: string; brandName: string }) {
  const [plan, setPlan] = useState<BillGuardPlan | null>(null);
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
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Bill Guard unavailable.');
      setPlan(data.billGuard);
      setForecast(data.forecast);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bill Guard unavailable.');
    } finally {
      setBusy(false);
    }
  }, [reserve, tenantKey]);

  useEffect(() => {
    void load('500');
  }, [tenantKey]);

  const thirtyDay = plan?.horizons.find((horizon) => horizon.days === 30) || null;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-800">Bill Guard</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">Planning only</span>
            </div>
            <h1 className="m-0 mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Protect the bills you already know are coming.</h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">{brandName} compares your simulated balance, expected income, known bills, planned savings, and reserve so upcoming obligations are easier to understand before you spend.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/prototype?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 no-underline shadow-sm">← Dashboard</a>
            <a href={`/prototype/cashflow?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl bg-[#0b153d] px-4 py-3 text-sm font-black text-white no-underline shadow-sm">Safe-to-Spend</a>
          </div>
        </header>

        {message ? <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{message}</div> : null}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <article className="overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#10175d_0%,#4f46e5_58%,#22d3ee_145%)] p-6 text-white shadow-xl sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Bill coverage check</div>
            <h2 className="m-0 mt-3 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">{busy ? 'Checking known bills…' : headline(plan)}</h2>
            <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <div className="text-xs font-bold text-white/65">Lowest 7/14/30-day coverage</div>
                <div className="mt-1 text-[46px] font-black tracking-[-0.06em]">{busy || !plan ? '—' : `${plan.lowestCoveragePercent}%`}</div>
              </div>
              <div className="pb-2 text-sm text-white/75">
                <b className="text-white">{plan ? dollars(plan.knownBillsNext30DaysCents) : '—'}</b> in known bills over the next 30 days.
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/12 px-3 py-2">Balance {forecast ? dollars(forecast.currentBalanceCents) : '—'}</span>
              <span className="rounded-full bg-white/12 px-3 py-2">Reserve {forecast ? dollars(forecast.reserveCents) : '—'}</span>
              <span className="rounded-full bg-white/12 px-3 py-2">No funds moved</span>
            </div>
          </article>

          <article className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Next known bill</div>
            <div className="mt-2 text-2xl font-black tracking-[-0.04em]">{plan?.nextBill ? dollars(plan.nextBill.amountCents) : '—'}</div>
            <h2 className="m-0 mt-1 text-base font-black">{plan?.nextBill?.name || 'No bill in view'}</h2>
            <p className="m-0 mt-1 text-xs leading-5 text-slate-500">{plan?.nextBill ? `${shortDate(plan.nextBill.scheduledFor)} · ${plan.nextBill.confidence}${plan.nextBill.recurring ? ' · recurring' : ''}` : 'No known upcoming bill was found in the current prototype forecast.'}</p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">This is a planning reminder only. Bill Guard does not schedule, pay, reserve funds for, or guarantee this bill.</div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {(plan?.horizons || []).map((horizon) => (
            <article key={horizon.days} className="rounded-[24px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.06)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{horizon.days}-day bill coverage</div>
                  <div className="mt-2 text-3xl font-black tracking-[-0.05em]">{horizon.coveragePercent}%</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusStyle(horizon.status)}`}>{horizon.status}</span>
              </div>
              <div className="mt-5 grid gap-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Known bills</span><b>{dollars(horizon.knownBillsCents)}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Scheduled</span><b>{dollars(horizon.scheduledBillsCents)}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Estimated</span><b>{dollars(horizon.estimatedBillsCents)}</b></div>
                <div className="flex justify-between"><span className="text-slate-500">Available after reserve + planned savings</span><b>{dollars(horizon.availableForBillsCents)}</b></div>
                <div className="mt-2 flex justify-between border-t border-slate-100 pt-3"><span className="font-bold text-slate-500">Uncovered known bills</span><b className={horizon.uncoveredBillsCents > 0 ? 'text-rose-700' : 'text-emerald-700'}>{dollars(horizon.uncoveredBillsCents)}</b></div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">30-day protected view</div>
            <h2 className="m-0 mt-2 text-xl font-black">What the plan is accounting for</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Scheduled bills</span><b>{plan ? dollars(plan.scheduledBillsNext30DaysCents) : '—'}</b></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Estimated bills</span><b>{plan ? dollars(plan.estimatedBillsNext30DaysCents) : '—'}</b></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Cash after bills, reserve + planned savings</span><b className={thirtyDay && thirtyDay.cashAfterBillsSavingsAndReserveCents < 0 ? 'text-rose-700' : 'text-emerald-700'}>{thirtyDay ? dollars(thirtyDay.cashAfterBillsSavingsAndReserveCents) : '—'}</b></div>
            </div>
          </section>

          <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Coverage confidence</div>
            <h2 className="m-0 mt-2 text-xl font-black text-amber-950">Known does not mean complete.</h2>
            <p className="m-0 mt-2 text-xs leading-5 text-amber-900/80">{plan?.estimatedBillCount || 0} bill(s) in the 30-day view are estimates. Unknown obligations, pending transactions, fees, cash activity, or changed due dates may not be reflected.</p>
            <ul className="mb-0 mt-4 grid gap-2 pl-5 text-xs leading-5 text-amber-900/80">
              {(plan?.assumptions || []).map((assumption) => <li key={assumption}>{assumption}</li>)}
            </ul>
          </section>
        </div>

        <section className="mt-5 rounded-[24px] bg-[#0b153d] p-5 text-white shadow-xl sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><span className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200">Autopay</span><b className="mt-1 block">OFF</b></div>
            <div><span className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200">Funds reserved</span><b className="mt-1 block">NO</b></div>
            <div><span className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200">Live bill provider</span><b className="mt-1 block">NOT CONNECTED</b></div>
            <div><span className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-200">Source</span><b className="mt-1 block">{forecast?.source === 'supabase' ? 'Persistent demo' : 'Memory demo'}</b></div>
          </div>
        </section>

        <section className="mt-5 rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Reserve scenario</div><h2 className="m-0 mt-2 text-lg font-black">See how a different cushion changes coverage.</h2></div>
            <label className="flex min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <span className="grid w-10 place-items-center text-sm text-slate-400">$</span>
              <input aria-label="Reserve amount" value={reserve} onChange={(event) => setReserve(event.target.value)} type="number" min="0" max="10000" step="25" className="min-w-0 flex-1 border-0 bg-transparent px-2 text-base font-black text-slate-950 outline-none" />
              <button type="button" onClick={() => void load()} disabled={busy} className="rounded-xl border-0 bg-indigo-600 px-4 text-xs font-black text-white disabled:opacity-50">{busy ? '...' : 'Update'}</button>
            </label>
          </div>
          <p className="m-0 mt-3 text-xs leading-5 text-slate-500">Changing this number only recalculates a prototype scenario. It does not move or lock money.</p>
        </section>

        <footer className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
          <b className="text-slate-700">Bill Guard boundary:</b> {plan?.disclosure || 'Simulation-only planning.'} A future live bill-pay or autopay feature would require an approved regulated program, authenticated customer authorization, exact provider integration, payment-status handling, reversals/returns, reconciliation, support, fraud controls, and approved customer terms before launch.
        </footer>
      </div>
    </main>
  );
}
