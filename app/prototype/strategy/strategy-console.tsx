'use client';

import { FormEvent, useMemo, useState } from 'react';

type CharterMilestone = {
  id: string;
  phase: string;
  label: string;
  status: 'implemented-software' | 'future-internal-work' | 'external-evidence-required';
  complete: boolean;
  evidence: string;
};

type CharterStatus = {
  longTermGoal: 'future-chartered-bank';
  currentPhase: string;
  currentOperatingPosture: string;
  businessModelThesisDefined: false;
  targetCustomerSegmentValidated: false;
  painfulProblemValidated: false;
  distributionAdvantageValidated: false;
  primaryNonInterchangeRevenueModelValidated: false;
  driverBasedUnitEconomicsModelBuilt: false;
  unitEconomicsAssumptionsExternallyValidated: false;
  charterRouteSelected: false;
  charterApplicationFiled: false;
  depositInsuranceApproved: false;
  openingAuthorizationReceived: false;
  bankCharterEffective: false;
  fdicInsuranceEffective: false;
  customerFacingBankClaimAuthorized: false;
  milestones: CharterMilestone[];
  disclosure: string;
};

type EconomicsControls = {
  driverBasedScenarioEngineImplemented: true;
  containsIndustryDefaultAssumptions: false;
  retainedInterchangeModeledSeparately: true;
  sponsorProviderCostsModeled: true;
  fraudLossesModeled: true;
  supportCostsModeled: true;
  complianceOperationsCostsModeled: true;
  acquisitionAndOnboardingCostsModeled: true;
  fixedCorporateOverheadModeled: false;
  capitalAndLiquidityCostsModeled: false;
  regulatoryCapitalModelImplemented: false;
  assumptionsValidated: false;
  approvedForFundraising: false;
  approvedForSponsorDiligence: false;
  approvedForCharterApplication: false;
  disclosure: string;
};

type EconomicsResult = {
  label: string;
  perActiveCustomer: {
    monthlyRetainedInterchangeRevenueCents: number;
    monthlySubscriptionRevenueCents: number;
    monthlyOtherRevenueCents: number;
    monthlyTotalRevenueCents: number;
    monthlySponsorProviderCostCents: number;
    monthlyCardPaymentCostCents: number;
    monthlyFraudLossCents: number;
    monthlySupportCostCents: number;
    monthlyComplianceOpsCostCents: number;
    monthlyServicingCostCents: number;
    monthlyOtherVariableCostCents: number;
    monthlyTotalVariableCostCents: number;
    monthlyContributionCents: number;
    contributionMarginBps: number | null;
    upfrontAcquisitionAndOnboardingCostCents: number;
    simplePaybackMonths: number | null;
    modeledLifetimeContributionBeforeAcquisitionCents: number;
    modeledLifetimeContributionAfterAcquisitionCents: number;
  };
  portfolio: {
    activeCustomers: number;
    monthlyRevenueCents: number;
    monthlyVariableCostCents: number;
    monthlyContributionCents: number;
  };
  interpretation: {
    contributionPositive: boolean;
    acquisitionPaybackAvailable: boolean;
    modeledLifetimeContributionPositiveAfterAcquisition: boolean;
  };
  limitations: {
    scenarioOnly: true;
    assumptionsValidated: false;
    excludesFixedCorporateOverhead: true;
    excludesCapitalAndLiquidityCosts: true;
    excludesCreditLossesUnlessEnteredAsOtherCost: true;
    excludesTaxes: true;
    excludesRegulatoryCapitalModel: true;
    approvedForFundraising: false;
    approvedForSponsorDiligence: false;
    approvedForCharterApplication: false;
  };
  disclosure: string;
};

type FormState = {
  label: string;
  activeCustomers: string;
  monthlyDebitSpend: string;
  retainedInterchangeBps: string;
  monthlySubscriptionRevenue: string;
  monthlyOtherRevenue: string;
  monthlySponsorProviderCost: string;
  monthlyCardPaymentCost: string;
  monthlyFraudLoss: string;
  monthlySupportCost: string;
  monthlyComplianceOpsCost: string;
  monthlyServicingCost: string;
  monthlyOtherVariableCost: string;
  acquisitionCost: string;
  onboardingIdentityCost: string;
  modeledCustomerLifetimeMonths: string;
};

const EMPTY_FORM: FormState = {
  label: '',
  activeCustomers: '',
  monthlyDebitSpend: '',
  retainedInterchangeBps: '',
  monthlySubscriptionRevenue: '',
  monthlyOtherRevenue: '',
  monthlySponsorProviderCost: '',
  monthlyCardPaymentCost: '',
  monthlyFraudLoss: '',
  monthlySupportCost: '',
  monthlyComplianceOpsCost: '',
  monthlyServicingCost: '',
  monthlyOtherVariableCost: '',
  acquisitionCost: '',
  onboardingIdentityCost: '',
  modeledCustomerLifetimeMonths: ''
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function dollars(cents: number) {
  return money.format(cents / 100);
}

function percentFromBps(bps: number | null) {
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

function statusLabel(milestone: CharterMilestone) {
  if (milestone.complete) return 'Implemented';
  if (milestone.status === 'future-internal-work') return 'Build / validate';
  return 'External evidence';
}

function statusTone(milestone: CharterMilestone) {
  if (milestone.complete) return 'bg-emerald-100 text-emerald-700';
  if (milestone.status === 'future-internal-work') return 'bg-indigo-100 text-indigo-700';
  return 'bg-amber-100 text-amber-800';
}

function ScenarioInput({
  label,
  value,
  onChange,
  suffix,
  step = '0.01',
  whole = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  step?: string;
  whole?: boolean;
}) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.07em] text-slate-500">
      {label}
      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 focus-within:border-indigo-400">
        <input
          type="number"
          min="0"
          step={whole ? '1' : step}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none"
        />
        {suffix ? <span className="ml-2 text-xs font-black normal-case tracking-normal text-slate-400">{suffix}</span> : null}
      </div>
    </label>
  );
}

export function StrategyConsole({
  tenantKey,
  brandName,
  charter,
  economicsControls
}: {
  tenantKey: string;
  brandName: string;
  charter: CharterStatus;
  economicsControls: EconomicsControls;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState<EconomicsResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const businessProof = useMemo(() => [
    ['Target customer segment', charter.targetCustomerSegmentValidated],
    ['Painful financial problem', charter.painfulProblemValidated],
    ['Distribution advantage', charter.distributionAdvantageValidated],
    ['Non-interchange revenue thesis', charter.primaryNonInterchangeRevenueModelValidated],
    ['Validated unit economics', charter.unitEconomicsAssumptionsExternallyValidated]
  ] as const, [charter]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function runScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const scenario = {
        label: form.label.trim() || 'Operator-entered scenario',
        activeCustomers: toWhole(form.activeCustomers, 'Active customers'),
        monthlyDebitSpendPerActiveCustomerCents: toCents(form.monthlyDebitSpend),
        retainedInterchangeBps: toWhole(form.retainedInterchangeBps, 'Retained interchange bps'),
        monthlySubscriptionRevenuePerActiveCustomerCents: toCents(form.monthlySubscriptionRevenue),
        monthlyOtherRevenuePerActiveCustomerCents: toCents(form.monthlyOtherRevenue),
        monthlySponsorProviderCostPerActiveCustomerCents: toCents(form.monthlySponsorProviderCost),
        monthlyCardPaymentCostPerActiveCustomerCents: toCents(form.monthlyCardPaymentCost),
        monthlyFraudLossPerActiveCustomerCents: toCents(form.monthlyFraudLoss),
        monthlySupportCostPerActiveCustomerCents: toCents(form.monthlySupportCost),
        monthlyComplianceOpsCostPerActiveCustomerCents: toCents(form.monthlyComplianceOpsCost),
        monthlyServicingCostPerActiveCustomerCents: toCents(form.monthlyServicingCost),
        monthlyOtherVariableCostPerActiveCustomerCents: toCents(form.monthlyOtherVariableCost),
        acquisitionCostPerNewCustomerCents: toCents(form.acquisitionCost),
        onboardingIdentityCostPerNewCustomerCents: toCents(form.onboardingIdentityCost),
        modeledCustomerLifetimeMonths: toWhole(form.modeledCustomerLifetimeMonths, 'Modeled customer lifetime months')
      };

      const response = await fetch('/api/prototype/unit-economics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantKey, scenario })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Scenario calculation failed.');
      setResult(data.result);
      setMessage('Scenario calculated from your entered assumptions. Nothing was persisted or validated as a market forecast.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Scenario calculation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4 pr-20">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Strategy lab</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">Planning only</span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">No market defaults</span>
            </div>
            <h1 className="m-0 mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">{brandName} institution strategy</h1>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Build a durable fintech business first, preserve sponsor portability, and prepare for a future charter path without representing the roadmap as regulatory authority.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/prototype/operations?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 no-underline shadow-sm">Operations</a>
            <a href={`/prototype?tenant=${encodeURIComponent(tenantKey)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 no-underline shadow-sm">Banking demo</a>
          </div>
        </header>

        {message ? <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" role="status" aria-live="polite">{message}</div> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[22px] bg-[#0b153d] p-5 text-white shadow-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200">Long-term goal</div>
            <div className="mt-2 text-xl font-black">Future chartered bank</div>
            <p className="m-0 mt-2 text-xs leading-5 text-white/65">Strategic direction only. It is not a charter application, approval, deposit insurance, or opening authority.</p>
          </article>
          <article className="rounded-[22px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.07)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Current phase</div>
            <div className="mt-2 text-xl font-black text-indigo-700">Fintech proof</div>
            <p className="m-0 mt-2 text-xs leading-5 text-slate-500">Simulation controls exist; product-market fit, business economics, sponsor operation, and charter feasibility still require evidence.</p>
          </article>
          <article className="rounded-[22px] bg-white p-5 shadow-[0_12px_35px_rgba(30,41,59,.07)]">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Bank authority</div>
            <div className="mt-2 text-xl font-black text-rose-700">Not granted</div>
            <p className="m-0 mt-2 text-xs leading-5 text-slate-500">Charter effective: no · FDIC insurance effective: no · Opening authorization: no · Customer-facing bank claim authorized: no.</p>
          </article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.35fr]">
          <div className="grid content-start gap-5">
            <article className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Business proof gate</div>
                  <h2 className="m-0 mt-2 text-xl font-black tracking-[-0.03em]">Earn the right to pursue the charter</h2>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">Unvalidated</span>
              </div>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-500">A generic “better banking app” is not treated as a bank business plan. These need evidence before the charter path advances.</p>
              <div className="mt-4 grid gap-2">
                {businessProof.map(([label, complete]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 text-xs">
                    <b>{label}</b>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{complete ? 'Validated' : 'Needs evidence'}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Institution roadmap</div>
              <h2 className="m-0 mt-2 text-xl font-black tracking-[-0.03em]">Milestones stay evidence-based</h2>
              <div className="mt-4 grid gap-3">
                {charter.milestones.map((milestone) => (
                  <div key={milestone.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{milestone.phase.replaceAll('-', ' ')}</div>
                        <div className="mt-1 text-sm font-black">{milestone.label}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${statusTone(milestone)}`}>{statusLabel(milestone)}</span>
                    </div>
                    <p className="m-0 mt-2 text-xs leading-5 text-slate-500">{milestone.evidence}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(30,41,59,.07)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Scenario economics</div>
                <h2 className="m-0 mt-2 text-xl font-black tracking-[-0.03em]">Enter every assumption yourself</h2>
                <p className="m-0 mt-2 max-w-2xl text-xs leading-5 text-slate-500">No CAC, interchange, fraud, sponsor, support, compliance, or retention benchmark is prefilled. Zero is not silently assumed: every numeric field is required before calculation.</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">Not a forecast</span>
            </div>

            <form onSubmit={runScenario} className="mt-5 grid gap-5">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.07em] text-slate-500">
                Scenario label
                <input value={form.label} onChange={(event) => setField('label', event.target.value)} maxLength={120} placeholder="e.g. Internal base case — sourced assumptions only" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none focus:border-indigo-400" />
              </label>

              <div>
                <div className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">Scale and retained revenue assumptions</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <ScenarioInput label="Active customers" value={form.activeCustomers} onChange={(value) => setField('activeCustomers', value)} suffix="customers" whole />
                  <ScenarioInput label="Monthly debit spend / active customer" value={form.monthlyDebitSpend} onChange={(value) => setField('monthlyDebitSpend', value)} suffix="$" />
                  <ScenarioInput label="Retained interchange" value={form.retainedInterchangeBps} onChange={(value) => setField('retainedInterchangeBps', value)} suffix="bps" whole />
                  <ScenarioInput label="Subscription revenue / active customer / month" value={form.monthlySubscriptionRevenue} onChange={(value) => setField('monthlySubscriptionRevenue', value)} suffix="$" />
                  <ScenarioInput label="Other revenue / active customer / month" value={form.monthlyOtherRevenue} onChange={(value) => setField('monthlyOtherRevenue', value)} suffix="$" />
                  <ScenarioInput label="Modeled customer lifetime" value={form.modeledCustomerLifetimeMonths} onChange={(value) => setField('modeledCustomerLifetimeMonths', value)} suffix="months" whole />
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">Monthly variable cost assumptions per active customer</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <ScenarioInput label="Sponsor / provider cost" value={form.monthlySponsorProviderCost} onChange={(value) => setField('monthlySponsorProviderCost', value)} suffix="$" />
                  <ScenarioInput label="Card / payment cost" value={form.monthlyCardPaymentCost} onChange={(value) => setField('monthlyCardPaymentCost', value)} suffix="$" />
                  <ScenarioInput label="Fraud loss" value={form.monthlyFraudLoss} onChange={(value) => setField('monthlyFraudLoss', value)} suffix="$" />
                  <ScenarioInput label="Customer support cost" value={form.monthlySupportCost} onChange={(value) => setField('monthlySupportCost', value)} suffix="$" />
                  <ScenarioInput label="Compliance operations cost" value={form.monthlyComplianceOpsCost} onChange={(value) => setField('monthlyComplianceOpsCost', value)} suffix="$" />
                  <ScenarioInput label="Servicing cost" value={form.monthlyServicingCost} onChange={(value) => setField('monthlyServicingCost', value)} suffix="$" />
                  <ScenarioInput label="Other variable cost" value={form.monthlyOtherVariableCost} onChange={(value) => setField('monthlyOtherVariableCost', value)} suffix="$" />
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">Upfront acquisition and onboarding assumptions</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <ScenarioInput label="Acquisition cost / new customer" value={form.acquisitionCost} onChange={(value) => setField('acquisitionCost', value)} suffix="$" />
                  <ScenarioInput label="Onboarding / identity cost / new customer" value={form.onboardingIdentityCost} onChange={(value) => setField('onboardingIdentityCost', value)} suffix="$" />
                </div>
              </div>

              <button type="submit" disabled={busy} aria-busy={busy} className="h-12 rounded-2xl border-0 bg-indigo-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
                {busy ? 'Calculating…' : 'Calculate entered scenario'}
              </button>
            </form>

            {result ? (
              <div className="mt-6" aria-live="polite">
                <div className="rounded-[22px] border border-indigo-100 bg-indigo-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-indigo-600">Calculated scenario</div>
                      <div className="mt-1 text-lg font-black">{result.label}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${result.interpretation.contributionPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{result.interpretation.contributionPositive ? 'Positive variable contribution' : 'Negative variable contribution'}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Revenue / active / month</div><div className="mt-1 text-xl font-black">{dollars(result.perActiveCustomer.monthlyTotalRevenueCents)}</div></div>
                    <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Variable cost / active / month</div><div className="mt-1 text-xl font-black">{dollars(result.perActiveCustomer.monthlyTotalVariableCostCents)}</div></div>
                    <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Contribution / active / month</div><div className="mt-1 text-xl font-black">{dollars(result.perActiveCustomer.monthlyContributionCents)}</div><div className="mt-1 text-xs text-slate-500">{percentFromBps(result.perActiveCustomer.contributionMarginBps)} of modeled revenue</div></div>
                    <div className="rounded-2xl bg-white p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Simple acquisition payback</div><div className="mt-1 text-xl font-black">{result.perActiveCustomer.simplePaybackMonths === null ? 'No payback' : `${result.perActiveCustomer.simplePaybackMonths} mo`}</div></div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-100 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">Per-active-customer revenue</div>
                    <div className="mt-3 grid gap-2 text-xs">
                      <div className="flex justify-between gap-4"><span>Retained interchange</span><b>{dollars(result.perActiveCustomer.monthlyRetainedInterchangeRevenueCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Subscription</span><b>{dollars(result.perActiveCustomer.monthlySubscriptionRevenueCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Other revenue</span><b>{dollars(result.perActiveCustomer.monthlyOtherRevenueCents)}</b></div>
                    </div>
                  </section>
                  <section className="rounded-2xl border border-slate-100 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">Per-active-customer variable costs</div>
                    <div className="mt-3 grid gap-2 text-xs">
                      <div className="flex justify-between gap-4"><span>Sponsor / provider</span><b>{dollars(result.perActiveCustomer.monthlySponsorProviderCostCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Card / payment</span><b>{dollars(result.perActiveCustomer.monthlyCardPaymentCostCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Fraud loss</span><b>{dollars(result.perActiveCustomer.monthlyFraudLossCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Support</span><b>{dollars(result.perActiveCustomer.monthlySupportCostCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Compliance operations</span><b>{dollars(result.perActiveCustomer.monthlyComplianceOpsCostCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Servicing</span><b>{dollars(result.perActiveCustomer.monthlyServicingCostCents)}</b></div>
                      <div className="flex justify-between gap-4"><span>Other variable</span><b>{dollars(result.perActiveCustomer.monthlyOtherVariableCostCents)}</b></div>
                    </div>
                  </section>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-100 p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Active customers</div><div className="mt-1 text-lg font-black">{integer.format(result.portfolio.activeCustomers)}</div></div>
                  <div className="rounded-2xl border border-slate-100 p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Portfolio monthly revenue</div><div className="mt-1 text-lg font-black">{dollars(result.portfolio.monthlyRevenueCents)}</div></div>
                  <div className="rounded-2xl border border-slate-100 p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Portfolio monthly variable cost</div><div className="mt-1 text-lg font-black">{dollars(result.portfolio.monthlyVariableCostCents)}</div></div>
                  <div className="rounded-2xl border border-slate-100 p-4"><div className="text-[9px] font-black uppercase tracking-wide text-slate-400">Portfolio monthly contribution</div><div className="mt-1 text-lg font-black">{dollars(result.portfolio.monthlyContributionCents)}</div></div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                  <b className="text-slate-800">Lifetime sensitivity:</b> modeled contribution before acquisition {dollars(result.perActiveCustomer.modeledLifetimeContributionBeforeAcquisitionCents)}; after acquisition/onboarding {dollars(result.perActiveCustomer.modeledLifetimeContributionAfterAcquisitionCents)}. This is arithmetic on the entered lifetime assumption—not observed retention or LTV evidence.
                </div>

                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                  <b>What this result excludes:</b> fixed corporate overhead, taxes, bank capital/liquidity costs, regulatory-capital modeling, and credit losses unless entered as another cost. It is not approved for fundraising, sponsor diligence, or a charter application.
                </div>
              </div>
            ) : null}
          </article>
        </section>

        <footer className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
          <b className="text-slate-700">Strategy boundary:</b> {economicsControls.disclosure} {charter.disclosure}
        </footer>
      </div>
    </main>
  );
}
