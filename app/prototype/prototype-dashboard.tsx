'use client';

import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from 'react';

type Brand = {
  key: string;
  name: string;
  shortName: string;
  legalName: string;
  supportEmail: string;
  accent: string;
  accentSecondary: string;
  logoText: string;
  productDisclosure: string;
  bankingDisclosure: string;
};

type Account = {
  id: string;
  label: string;
  accountType: 'checking' | 'savings' | 'wallet';
  routingNumber: string;
  accountLast4: string;
  balanceCents: number;
  currency: 'USD';
  simulated: true;
};

type Transaction = {
  id: string;
  accountId: string;
  direction: 'debit' | 'credit';
  amountCents: number;
  name: string;
  category: string;
  status: 'pending' | 'posted' | 'failed';
  provider: string;
  occurredAt: string;
};

type Snapshot = {
  source: 'memory' | 'supabase';
  tenantKey: string;
  userId: string;
  displayName: string;
  totalBalanceCents: number;
  accounts: Account[];
  transactions: Transaction[];
  disclosure: string;
};

type LinkedBank = {
  mode: 'local_mock' | 'plaid_sandbox';
  institutionName: string;
  accounts: Array<{ id: string; name: string; last4: string | null; subtype: string | null; currentBalance: number | null }>;
  transactions: Array<{ id: string; accountId: string; name: string; amountCents: number; date: string; pending: boolean; category: string }>;
  persisted: boolean;
  disclosure: string;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatMoney(cents: number) {
  return money.format(cents / 100);
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="m-0 text-[17px] font-black tracking-[-0.03em] text-slate-950">{title}</h2>
        {detail ? <p className="m-0 mt-1 text-xs text-slate-500">{detail}</p> : null}
      </div>
    </div>
  );
}

export function PrototypeDashboard({ initialBrand }: { initialBrand: Brand }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [linkedBank, setLinkedBank] = useState<LinkedBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);

  const brandStyle = {
    '--prototype-accent': initialBrand.accent,
    '--prototype-accent-2': initialBrand.accentSecondary
  } as CSSProperties;

  async function refreshSummary() {
    const response = await fetch(`/api/prototype/summary?tenant=${encodeURIComponent(initialBrand.key)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Prototype ledger unavailable.');
    setSnapshot(data.snapshot);
  }

  useEffect(() => {
    refreshSummary()
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Prototype ledger unavailable.'))
      .finally(() => setLoading(false));
  }, [initialBrand.key]);

  const primaryAccount = snapshot?.accounts[0] || null;
  const sourceLabel = snapshot?.source === 'supabase' ? 'Supabase ledger' : 'Memory demo';

  const spendingCents = useMemo(() => {
    return snapshot?.transactions
      .filter((transaction) => transaction.direction === 'debit')
      .reduce((sum, transaction) => sum + transaction.amountCents, 0) || 0;
  }, [snapshot]);

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!primaryAccount) return;
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/prototype/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey: initialBrand.key,
          fromAccountId: primaryAccount.id,
          recipient,
          amount: Number(amount),
          memo: 'White-label prototype transfer'
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Transfer simulation failed.');
      setMessage(data.transfer.message || 'Simulated transfer recorded.');
      setRecipient('');
      setAmount('');
      await refreshSummary();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Transfer simulation failed.');
    } finally {
      setBusy(false);
    }
  }

  async function connectSandboxBank() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/sandbox/plaid/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantKey: initialBrand.key })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Sandbox bank could not be connected.');
      setLinkedBank(data.linked);
      setMessage(data.linked.mode === 'plaid_sandbox'
        ? 'Plaid Sandbox connected with synthetic institution data.'
        : 'Local mock bank connected. Add Plaid Sandbox credentials to exercise the external sandbox API.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sandbox bank could not be connected.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={brandStyle} className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[244px] shrink-0 flex-col bg-[#07123c] px-5 py-7 text-white md:flex">
          <div className="flex items-center gap-3 px-2">
            <span
              className="grid h-11 w-11 place-items-center rounded-2xl text-sm font-black shadow-lg"
              style={{ background: `linear-gradient(135deg, ${initialBrand.accentSecondary}, ${initialBrand.accent})` }}
            >
              {initialBrand.logoText}
            </span>
            <div>
              <div className="text-[17px] font-black leading-tight">{initialBrand.name}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">White label</div>
            </div>
          </div>

          <nav className="mt-10 grid gap-2 text-sm font-bold">
            {['Dashboard', 'Accounts', 'Transfers', 'Cards', 'Insights'].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`rounded-xl px-4 py-3 no-underline ${index === 0 ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/7 p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Prototype mode</div>
            <p className="m-0 mt-2 text-xs leading-5 text-white/70">No real deposits, cards, ACH, wires, or crypto move through this route.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">Simulation only</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 shadow-sm">{sourceLabel}</span>
              </div>
              <h1 className="m-0 text-[28px] font-black tracking-[-0.045em] sm:text-[34px]">Welcome back, {snapshot?.displayName || 'Nova'}.</h1>
              <p className="m-0 mt-1.5 text-sm text-slate-500">A partner-ready banking experience under {initialBrand.name}.</p>
            </div>
            <button
              type="button"
              onClick={connectSandboxBank}
              disabled={busy}
              className="rounded-2xl border-0 px-4 py-3 text-sm font-black text-white shadow-lg disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${initialBrand.accent}, ${initialBrand.accentSecondary})` }}
            >
              {busy ? 'Connecting…' : 'Connect sandbox bank'}
            </button>
          </header>

          {message ? (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" role="status">
              {message}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,0.8fr)]">
            <div className="grid min-w-0 gap-5">
              <section
                className="relative overflow-hidden rounded-[26px] p-6 text-white shadow-xl sm:p-8"
                style={{ background: `linear-gradient(125deg, #111b65 0%, ${initialBrand.accent} 58%, ${initialBrand.accentSecondary} 140%)` }}
              >
                <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border-[28px] border-white/10" />
                <div className="absolute bottom-[-95px] right-24 h-52 w-52 rounded-full bg-white/8 blur-sm" />
                <div className="relative z-10">
                  <div className="text-sm font-bold text-white/70">Total simulated balance</div>
                  <div className="mt-2 text-[42px] font-black tracking-[-0.055em] sm:text-[54px]">
                    {loading ? '—' : formatMoney(snapshot?.totalBalanceCents || 0)}
                  </div>
                  <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-white/80">
                    <span className="rounded-full bg-white/12 px-3 py-1.5">Tenant: {initialBrand.key}</span>
                    <span className="rounded-full bg-white/12 px-3 py-1.5">Ledger: {sourceLabel}</span>
                    <span className="rounded-full bg-white/12 px-3 py-1.5">Live rails: OFF</span>
                  </div>
                </div>
              </section>

              <section id="transfers" className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,0.07)] sm:p-6">
                <SectionTitle title="Quick actions" detail="Everything here is a sandbox or local simulation." />
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button type="button" onClick={() => setShowTransfer((value) => !value)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-lg">↗</span>
                    <b className="mt-3 block text-sm">Send</b>
                    <small className="mt-1 block text-slate-500">Virtual funds</small>
                  </button>
                  <button type="button" onClick={connectSandboxBank} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-lg">＋</span>
                    <b className="mt-3 block text-sm">Link bank</b>
                    <small className="mt-1 block text-slate-500">Sandbox only</small>
                  </button>
                  <button type="button" className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-fuchsia-50 text-lg">▣</span>
                    <b className="mt-3 block text-sm">Cards</b>
                    <small className="mt-1 block text-slate-500">UI preview</small>
                  </button>
                  <button type="button" className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:bg-slate-50">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-lg">◎</span>
                    <b className="mt-3 block text-sm">Insights</b>
                    <small className="mt-1 block text-slate-500">Demo spend</small>
                  </button>
                </div>

                {showTransfer ? (
                  <form onSubmit={submitTransfer} className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-[1fr_160px_auto] sm:items-end">
                    <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                      Mock recipient
                      <input value={recipient} onChange={(event) => setRecipient(event.target.value)} required placeholder="Alex Rivera" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                      Amount
                      <input type="number" min="0.01" max="10000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="25.00" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none" />
                    </label>
                    <button disabled={busy || !primaryAccount} type="submit" className="h-11 rounded-xl border-0 px-5 text-sm font-black text-white disabled:opacity-50" style={{ background: initialBrand.accent }}>
                      Simulate
                    </button>
                  </form>
                ) : null}
              </section>

              <section id="accounts" className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,0.07)] sm:p-6">
                <SectionTitle title="Accounts" detail="Synthetic account identifiers only." />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(snapshot?.accounts || []).map((account) => (
                    <article key={account.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">{account.accountType}</div>
                          <div className="mt-1 text-base font-black">{account.label}</div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">Simulated</span>
                      </div>
                      <div className="mt-5 text-2xl font-black tracking-[-0.04em]">{formatMoney(account.balanceCents)}</div>
                      <div className="mt-2 flex justify-between text-xs text-slate-500"><span>•••• {account.accountLast4}</span><span>Routing ••{account.routingNumber.slice(-4)}</span></div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,0.07)] sm:p-6">
                <SectionTitle title="Recent activity" detail="Persisted to Supabase when configured." />
                <div className="mt-4 divide-y divide-slate-100">
                  {(snapshot?.transactions || []).map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-3 py-3.5">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${transaction.direction === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {transaction.direction === 'credit' ? '↓' : '↗'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-sm">{transaction.name}</b>
                        <small className="mt-0.5 block text-slate-500">{transaction.category} · {shortDate(transaction.occurredAt)}</small>
                      </span>
                      <b className={`text-sm ${transaction.direction === 'credit' ? 'text-emerald-700' : 'text-slate-950'}`}>
                        {transaction.direction === 'credit' ? '+' : '−'}{formatMoney(transaction.amountCents)}
                      </b>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="grid content-start gap-5">
              <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,0.07)] sm:p-6">
                <SectionTitle title="Prototype health" detail="What is real vs simulated." />
                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><span>White-label brand</span><b className="text-emerald-700">Ready</b></div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><span>Demo ledger</span><b className="text-emerald-700">{snapshot?.source === 'supabase' ? 'Supabase' : 'Local'}</b></div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><span>Sandbox account link</span><b className="text-emerald-700">Ready</b></div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><span>Real money movement</span><b className="text-rose-700">Disabled</b></div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3"><span>KYC / AML</span><b className="text-amber-700">Partner stage</b></div>
                </div>
              </section>

              <section className="rounded-[24px] bg-[#0b153d] p-5 text-white shadow-xl sm:p-6">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">Partner-ready architecture</div>
                <h2 className="m-0 mt-2 text-xl font-black tracking-[-0.04em]">Swap the simulation layer, not the product.</h2>
                <div className="mt-5 grid gap-2 text-xs font-bold text-white/80">
                  <div className="rounded-xl bg-white/8 p-3">1. Branded Next.js experience</div>
                  <div className="rounded-xl bg-white/8 p-3">2. Tenant + ledger abstraction</div>
                  <div className="rounded-xl bg-white/8 p-3">3. Plaid / test-provider sandbox</div>
                  <div className="rounded-xl bg-white/8 p-3">4. Future BaaS adapter + sponsor bank</div>
                </div>
              </section>

              <section className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,0.07)] sm:p-6">
                <SectionTitle title="Spending preview" detail="Demo transaction analytics." />
                <div className="mt-5 text-[32px] font-black tracking-[-0.05em]">{formatMoney(spendingCents)}</div>
                <div className="mt-1 text-xs text-slate-500">Total simulated debits in this demo history</div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[62%] rounded-full" style={{ background: `linear-gradient(90deg, ${initialBrand.accent}, ${initialBrand.accentSecondary})` }} />
                </div>
              </section>

              {linkedBank ? (
                <section className="rounded-[24px] border border-cyan-100 bg-cyan-50/60 p-5 sm:p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.13em] text-cyan-700">{linkedBank.mode === 'plaid_sandbox' ? 'Plaid Sandbox' : 'Local mock'}</div>
                  <h2 className="m-0 mt-1 text-lg font-black">{linkedBank.institutionName}</h2>
                  <p className="m-0 mt-2 text-xs leading-5 text-slate-600">{linkedBank.accounts.length} synthetic account(s) connected. {linkedBank.persisted ? 'Safe account metadata persisted.' : 'Connection is session-only.'}</p>
                  <div className="mt-4 grid gap-2">
                    {linkedBank.accounts.slice(0, 3).map((account) => (
                      <div key={account.id} className="rounded-xl bg-white px-3 py-2.5 text-xs shadow-sm">
                        <b>{account.name}</b><span className="float-right text-slate-500">•••• {account.last4 || '----'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>

          <footer className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
            <b className="text-slate-700">Prototype disclosure:</b> {snapshot?.disclosure || initialBrand.productDisclosure} Real accounts, FDIC insurance claims, payment rails, card issuance, KYC/AML, and partner-bank disclosures must come from an approved live program before public financial-service launch.
          </footer>
        </section>
      </div>
    </main>
  );
}
