'use client';

import { FormEvent, useState } from 'react';

type CapitalForm = {
  label: string;
  planningTargetOpeningCapital: string;
  documentedCommittedCapital: string;
  documentedVerifiedSourceOfFunds: string;
  cashCurrentlyAvailableForProject: string;
  plannedPreOpeningOneTimeCosts: string;
  monthlyFintechOperatingBurn: string;
  monthlyBankOrganizationPreOpeningBurn: string;
  modeledMonthsUntilOpening: string;
  internalContingencyReserve: string;
};

type CapitalResult = {
  label: string;
  target: {
    planningTargetOpeningCapitalCents: number;
    targetSource: 'operator-entered-assumption';
    regulatorySufficiencyVerified: false;
  };
  funding: {
    documentedCommittedCapitalCents: number;
    documentedVerifiedSourceOfFundsCents: number;
    cashCurrentlyAvailableForProjectCents: number;
    commitmentCoverageBps: number | null;
    verifiedSourceCoverageBps: number | null;
    planningCapitalGapCents: number;
  };
  preOpening: {
    plannedPreOpeningOneTimeCostsCents: number;
    monthlyFintechOperatingBurnCents: number;
    monthlyBankOrganizationPreOpeningBurnCents: number;
    modeledMonthsUntilOpening: number;
    modeledOperatingBurnUntilOpeningCents: number;
    internalContingencyReserveCents: number;
    modeledTotalPreOpeningCashNeedCents: number;
    modeledCashGapBeforeOpeningCents: number;
    currentCashRunwayMonths: number | null;
  };
  limitations: {
    planningOnly: true;
    assumptionsValidated: false;
    regulatoryCapitalCalculationImplemented: false;
    riskWeightedAssetsModeled: false;
    leverageRatioModeled: false;
    liquidityRequirementModeled: false;
    sourceOfFundsAuthenticityVerifiedBySoftware: false;
    capitalPlanReviewedByQualifiedAdvisers: false;
    capitalPlanReviewedByRegulator: false;
    charterCapitalRequirementDetermined: false;
    approvedForFundraising: false;
    approvedForCharterApplication: false;
  };
  disclosure: string;
};

const EMPTY_FORM: CapitalForm = {
  label: '',
  planningTargetOpeningCapital: '',
  documentedCommittedCapital: '',
  documentedVerifiedSourceOfFunds: '',
  cashCurrentlyAvailableForProject: '',
  plannedPreOpeningOneTimeCosts: '',
  monthlyFintechOperatingBurn: '',
  monthlyBankOrganizationPreOpeningBurn: '',
  modeledMonthsUntilOpening: '',
  internalContingencyReserve: ''
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function dollars(cents: number) {
  return money.format(cents / 100);
}

function pct(bps: number | null) {
  if (bps === null) return 'N/A';
  return `${(bps / 100).toFixed(2)}%`;
}

function toCents(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) throw new Error('Every money input must be a non-negative number.');
  return Math.round(numeric * 100);
}

function toWhole(value: string, label: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || !Number.isInteger(numeric) || numeric < 0) throw new Error(`${label} must be a non-negative whole number.`);
  return numeric;
}

function MoneyField({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.07em] text-slate-500">
      {label}
      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400">
        <span className="mr-2 text-sm font-black text-slate-400">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none"
        />
      </div>
      {hint ? <span className="text-[10px] font-medium normal-case leading-4 tracking-normal text-slate-400">{hint}</span> : null}
    </label>
  );
}

export function CapitalPlanningPanel({ tenantKey }: { tenantKey: string }) {
  const [form, setForm] = useState<CapitalForm>(EMPTY_FORM);
  const [result, setResult] = useState<CapitalResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function setField<K extends keyof CapitalForm>(field: K, value: CapitalForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const scenario = {
        label: form.label.trim() || 'Operator-entered capital scenario',
        planningTargetOpeningCapitalCents: toCents(form.planningTargetOpeningCapital),
        documentedCommittedCapitalCents: toCents(form.documentedCommittedCapital),
        documentedVerifiedSourceOfFundsCents: toCents(form.documentedVerifiedSourceOfFunds),
        cashCurrentlyAvailableForProjectCents: toCents(form.cashCurrentlyAvailableForProject),
        plannedPreOpeningOneTimeCostsCents: toCents(form.plannedPreOpeningOneTimeCosts),
        monthlyFintechOperatingBurnCents: toCents(form.monthlyFintechOperatingBurn),
        monthlyBankOrganizationPreOpeningBurnCents: toCents(form.monthlyBankOrganizationPreOpeningBurn),
        modeledMonthsUntilOpening: toWhole(form.modeledMonthsUntilOpening, 'Modeled months until opening'),
        internalContingencyReserveCents: toCents(form.internalContingencyReserve)
      };

      const response = await fetch('/api/prototype/capital-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantKey, scenario })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Capital planning calculation failed.');
      setResult(data.result);
      setMessage('Planning scenario calculated from your entered assumptions. No regulatory capital requirement or source-of-funds authenticity was inferred.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Capital planning calculation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#f5f7fb] px-4 pb-10 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-white p-5 shadow-[0_16px_50px_rgba(30,41,59,.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Capital planning workbench</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em]">Model the gap without inventing the requirement</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Enter a planning target, capital commitments, evidence-backed source-of-funds amount, current project cash, expected pre-opening costs, burn, timing, and internal contingency. The target is your planning assumption—not a regulator-prescribed number.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">Planning target ≠ capital adequacy</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><b>Capital target rule:</b> no default charter-capital amount is built in. The applicable authorities and qualified advisers must determine the actual capital plan for the final proposal.</div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs leading-5 text-indigo-900"><b>Evidence rule:</b> an amount entered as “documented/verified source of funds” is still only an operator-entered amount here. This software does not authenticate bank statements, investor commitments, or source-of-funds records.</div>
        </div>

        {message ? <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" role="status" aria-live="polite">{message}</div> : null}

        <form onSubmit={calculate} className="mt-5 grid gap-5">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.07em] text-slate-500">
            Scenario label
            <input value={form.label} onChange={(event) => setField('label', event.target.value)} maxLength={120} placeholder="e.g. Internal planning target from adviser discussion" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none focus:border-indigo-400" />
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MoneyField label="Planning target opening capital" value={form.planningTargetOpeningCapital} onChange={(value) => setField('planningTargetOpeningCapital', value)} hint="Operator-entered assumption only; not a regulatory requirement." />
            <MoneyField label="Documented committed capital" value={form.documentedCommittedCapital} onChange={(value) => setField('documentedCommittedCapital', value)} hint="Enter only amounts you intend to support with private diligence evidence." />
            <MoneyField label="Documented / verified source-of-funds amount" value={form.documentedVerifiedSourceOfFunds} onChange={(value) => setField('documentedVerifiedSourceOfFunds', value)} hint="Software does not authenticate this evidence." />
            <MoneyField label="Cash currently available for project" value={form.cashCurrentlyAvailableForProject} onChange={(value) => setField('cashCurrentlyAvailableForProject', value)} />
            <MoneyField label="Planned pre-opening one-time costs" value={form.plannedPreOpeningOneTimeCosts} onChange={(value) => setField('plannedPreOpeningOneTimeCosts', value)} />
            <MoneyField label="Internal contingency reserve" value={form.internalContingencyReserve} onChange={(value) => setField('internalContingencyReserve', value)} hint="Internal planning reserve only; not a regulatory buffer." />
            <MoneyField label="Monthly fintech operating burn" value={form.monthlyFintechOperatingBurn} onChange={(value) => setField('monthlyFintechOperatingBurn', value)} />
            <MoneyField label="Monthly bank-organization pre-opening burn" value={form.monthlyBankOrganizationPreOpeningBurn} onChange={(value) => setField('monthlyBankOrganizationPreOpeningBurn', value)} />
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.07em] text-slate-500">
              Modeled months until opening
              <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400">
                <input type="number" min="0" max="120" step="1" required value={form.modeledMonthsUntilOpening} onChange={(event) => setField('modeledMonthsUntilOpening', event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none" />
                <span className="ml-2 text-xs font-black normal-case tracking-normal text-slate-400">months</span>
              </div>
            </label>
          </div>

          <button type="submit" disabled={busy} aria-busy={busy} className="h-12 rounded-2xl border-0 bg-emerald-700 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
            {busy ? 'Calculating…' : 'Calculate planning gap and runway'}
          </button>
        </form>

        {result ? (
          <div className="mt-6 grid gap-4" aria-live="polite">
            <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Planning scenario</div><div className="mt-1 text-lg font-black">{result.label}</div></div>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">Regulatory sufficiency: not verified</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Planning target</div><div className="mt-1 text-lg font-black">{dollars(result.target.planningTargetOpeningCapitalCents)}</div></div>
                <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Committed coverage</div><div className="mt-1 text-lg font-black">{pct(result.funding.commitmentCoverageBps)}</div></div>
                <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Planning capital gap</div><div className="mt-1 text-lg font-black">{dollars(result.funding.planningCapitalGapCents)}</div></div>
                <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Current cash runway</div><div className="mt-1 text-lg font-black">{result.preOpening.currentCashRunwayMonths === null ? 'N/A' : `${result.preOpening.currentCashRunwayMonths} mo`}</div></div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-100 p-4 text-xs leading-5">
                <div className="font-black uppercase tracking-[0.1em] text-slate-400">Funding evidence arithmetic</div>
                <div className="mt-3 flex justify-between gap-4"><span>Committed capital</span><b>{dollars(result.funding.documentedCommittedCapitalCents)}</b></div>
                <div className="mt-2 flex justify-between gap-4"><span>Entered source-of-funds coverage of commitments</span><b>{pct(result.funding.verifiedSourceCoverageBps)}</b></div>
                <div className="mt-2 flex justify-between gap-4"><span>Current project cash</span><b>{dollars(result.funding.cashCurrentlyAvailableForProjectCents)}</b></div>
              </article>
              <article className="rounded-2xl border border-slate-100 p-4 text-xs leading-5">
                <div className="font-black uppercase tracking-[0.1em] text-slate-400">Pre-opening cash planning</div>
                <div className="mt-3 flex justify-between gap-4"><span>Modeled operating burn until opening</span><b>{dollars(result.preOpening.modeledOperatingBurnUntilOpeningCents)}</b></div>
                <div className="mt-2 flex justify-between gap-4"><span>Total modeled pre-opening cash need</span><b>{dollars(result.preOpening.modeledTotalPreOpeningCashNeedCents)}</b></div>
                <div className="mt-2 flex justify-between gap-4"><span>Modeled cash gap before opening</span><b>{dollars(result.preOpening.modeledCashGapBeforeOpeningCents)}</b></div>
              </article>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
              <b>Not modeled or verified:</b> regulatory capital calculations, risk-weighted assets, leverage ratios, liquidity requirements, validated deposit funding, approved stress testing, source-of-funds authenticity, adviser review, regulator review, or the actual charter capital requirement. This scenario is not approved for fundraising or a charter application.
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
