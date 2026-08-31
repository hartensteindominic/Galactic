'use client';

import { FormEvent, useState } from 'react';

export type ThreeYearBankPlanWorkbenchStatus = {
  sourceRegistryReviewedAt: string;
  minimumPlanningHorizonYears: number;
  mustExtendThroughExpectedStableProfitabilityIfLonger: true;
  containsDefaultRevenueAssumptions: false;
  containsDefaultGrowthAssumptions: false;
  containsDefaultDepositAssumptions: false;
  containsDefaultCapitalRequirement: false;
  containsDefaultProfitabilityDate: false;
  requiredSectionCount: number;
  populatedSectionCount: number;
  validatedSectionCount: number;
  approvedSectionCount: number;
  boardApproved: false;
  regulatorReviewed: false;
  regulatorAccepted: false;
  readyForCharterApplication: false;
  sections: ReadonlyArray<{
    id: string;
    label: string;
    category: string;
    populated: false;
    validated: false;
    approved: false;
    expectation: string;
  }>;
  disclosure: string;
};

type Evaluation = {
  structurallyCompleteDraft: true;
  projectionHorizonAtLeastThreeYears: true;
  stableProfitabilityHorizonRequirementSatisfied: boolean;
  marketEvidenceValidated: false;
  managementQualificationsVerified: false;
  financialProjectionAssumptionsValidated: false;
  projectionSchedulesReconciledToAccountingRecords: false;
  capitalAdequacyDetermined: false;
  liquidityAdequacyDetermined: false;
  riskFrameworkApproved: false;
  complianceApplicabilityApproved: false;
  boardApproved: false;
  qualifiedExternalReviewComplete: false;
  regulatorReviewed: false;
  regulatorAccepted: false;
  approvedForCharterApplication: false;
  readinessPromotionAllowed: false;
  disclosure: string;
};

function references(value: string) {
  return value.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean);
}

export function ThreeYearBankPlanPanel({ tenantKey, status }: { tenantKey: string; status: ThreeYearBankPlanWorkbenchStatus }) {
  const [planLabel, setPlanLabel] = useState('');
  const [proposedInstitutionRole, setProposedInstitutionRole] = useState('');
  const [proposedCharterRoute, setProposedCharterRoute] = useState('');
  const [targetMarketAndCustomers, setTargetMarketAndCustomers] = useState('');
  const [businessAndRevenueModel, setBusinessAndRevenueModel] = useState('');
  const [productsAndServices, setProductsAndServices] = useState('');
  const [distributionAndMarketing, setDistributionAndMarketing] = useState('');
  const [managementAndGovernance, setManagementAndGovernance] = useState('');
  const [recordsSystemsAndControls, setRecordsSystemsAndControls] = useState('');
  const [riskAndComplianceFramework, setRiskAndComplianceFramework] = useState('');
  const [financialManagementApproach, setFinancialManagementApproach] = useState('');
  const [projectionMethodology, setProjectionMethodology] = useState('');
  const [projectionHorizonYears, setProjectionHorizonYears] = useState('');
  const [stableProfitabilityExpectedWithinHorizon, setStableProfitabilityExpectedWithinHorizon] = useState('');
  const [capitalAndLiquidityApproach, setCapitalAndLiquidityApproach] = useState('');
  const [thirdPartyAndContinuityApproach, setThirdPartyAndContinuityApproach] = useState('');
  const [monitoringAndRevisionApproach, setMonitoringAndRevisionApproach] = useState('');
  const [downsideAndSensitivityScenarios, setDownsideAndSensitivityScenarios] = useState('');
  const [evidenceReferences, setEvidenceReferences] = useState('');
  const [accountablePlanOwnerRole, setAccountablePlanOwnerRole] = useState('');
  const [qualifiedReviewerRole, setQualifiedReviewerRole] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectionHorizonYears || !stableProfitabilityExpectedWithinHorizon) return;
    setBusy(true);
    setMessage('');
    setEvaluation(null);
    try {
      const response = await fetch('/api/prototype/three-year-bank-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey,
          candidate: {
            planLabel,
            proposedInstitutionRole,
            proposedCharterRoute,
            targetMarketAndCustomers,
            businessAndRevenueModel,
            productsAndServices,
            distributionAndMarketing,
            managementAndGovernance,
            recordsSystemsAndControls,
            riskAndComplianceFramework,
            financialManagementApproach,
            projectionMethodology,
            projectionHorizonYears: Number(projectionHorizonYears),
            stableProfitabilityExpectedWithinHorizon: stableProfitabilityExpectedWithinHorizon === 'yes',
            capitalAndLiquidityApproach,
            thirdPartyAndContinuityApproach,
            monitoringAndRevisionApproach,
            downsideAndSensitivityScenarios,
            evidenceReferences: references(evidenceReferences),
            accountablePlanOwnerRole,
            qualifiedReviewerRole,
            reviewedAt
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Bank-plan review failed.');
      setEvaluation(data.evaluation);
      setMessage('Draft is structurally complete only. No projection, owner, board action, regulator review, or filing readiness was validated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bank-plan review failed.');
    } finally {
      setBusy(false);
    }
  }

  const textFields: Array<[string, string, (value: string) => void, string]> = [
    ['Plan label', planLabel, setPlanLabel, 'Internal draft label only.'],
    ['Proposed institution role', proposedInstitutionRole, setProposedInstitutionRole, 'Describe the proposed role without assuming an approved charter.'],
    ['Proposed charter route', proposedCharterRoute, setProposedCharterRoute, 'State the evaluated/proposed route or unresolved alternatives; no default route is assumed.'],
    ['Target market + customers', targetMarketAndCustomers, setTargetMarketAndCustomers, 'Reference actual demand, customer, market, competition, and economic evidence.'],
    ['Business + revenue model', businessAndRevenueModel, setBusinessAndRevenueModel, 'Explain revenue/cost mechanics using sourced assumptions, not generic industry defaults.'],
    ['Products + services', productsAndServices, setProductsAndServices, 'Describe proposed products, permissions, dependencies, and constraints.'],
    ['Distribution + marketing', distributionAndMarketing, setDistributionAndMarketing, 'Measured acquisition/distribution thesis and approved-claims approach.'],
    ['Management + governance', managementAndGovernance, setManagementAndGovernance, 'Organizers, board, executives, control owners, authority, succession, conflicts.'],
    ['Records + systems + controls', recordsSystemsAndControls, setRecordsSystemsAndControls, 'Ledger, reconciliation, access, change, security, incidents, monitoring, evidence.'],
    ['Risk + compliance framework', riskAndComplianceFramework, setRiskAndComplianceFramework, 'Risk ownership, applicability, BSA/AML/sanctions as applicable, consumer compliance, complaints, audit.'],
    ['Financial-management approach', financialManagementApproach, setFinancialManagementApproach, 'Accounting, budgets, variance analysis, balance-sheet management, controls.'],
    ['Projection methodology', projectionMethodology, setProjectionMethodology, 'How sourced assumptions reconcile across income, balance sheet, liquidity, capital, and sensitivities.'],
    ['Capital + liquidity approach', capitalAndLiquidityApproach, setCapitalAndLiquidityApproach, 'Proposal-specific capital, funding, liquidity, source-of-funds, and contingency evidence.'],
    ['Third-party + continuity', thirdPartyAndContinuityApproach, setThirdPartyAndContinuityApproach, 'Critical vendors, allocation, monitoring, concentration, outage, exit, customer continuity.'],
    ['Monitoring + revision', monitoringAndRevisionApproach, setMonitoringAndRevisionApproach, 'Budget-to-actual, board/management cadence, triggers, plan-change governance.'],
    ['Downside + sensitivity scenarios', downsideAndSensitivityScenarios, setDownsideAndSensitivityScenarios, 'Adverse growth, revenue, loss, provider, funding, control, and delayed-profitability scenarios.'],
    ['Evidence references', evidenceReferences, setEvidenceReferences, 'One non-sensitive reference per line; do not paste confidential exhibits.'],
    ['Accountable plan-owner role', accountablePlanOwnerRole, setAccountablePlanOwnerRole, 'Human role only; software does not assign it.'],
    ['Qualified reviewer role', qualifiedReviewerRole, setQualifiedReviewerRole, 'Reviewer role/category; software does not create legal/regulatory approval.']
  ];

  return (
    <section className="bg-[#eef6ff] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Three-year bank plan · evidence skeleton</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Build the plan without inventing the bank</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Current OCC/FDIC planning sources are mapped into a structured draft. The workbench does not supply market, deposit, growth, revenue, loss, capital, liquidity, or profitability assumptions.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-xs font-bold leading-5 text-sky-900">
            {status.populatedSectionCount}/{status.requiredSectionCount} persisted sections populated · source review {status.sourceRegistryReviewedAt}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {status.sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{section.category.replaceAll('-', ' ')}</div>
              <div className="mt-1 text-sm font-black">{section.label}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">{section.expectation}</div>
              <div className="mt-2 text-xs font-bold text-amber-700">Not populated · not validated · not approved</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
          <b>No default financial truth:</b> growth, deposits, revenue, losses, capital requirement, liquidity requirement, and stable-profitability date all remain unset. Minimum plan horizon is {status.minimumPlanningHorizonYears} years, and the planning horizon must extend through expected stable profitability if longer under the current OCC planning principle used by this model.
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {textFields.map(([label, value, setter, placeholder]) => (
              <label key={label} className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {label}
                <textarea value={value} onChange={(event) => setter(event.target.value)} required rows={3} placeholder={placeholder} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950" />
              </label>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Projection horizon (years)
              <input type="number" min={3} max={10} step={1} value={projectionHorizonYears} onChange={(event) => setProjectionHorizonYears(event.target.value)} required placeholder="Enter 3–10" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Expected stable profitability within horizon?
              <select value={stableProfitabilityExpectedWithinHorizon} onChange={(event) => setStableProfitabilityExpectedWithinHorizon(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select based on evidenced projections…</option>
                <option value="yes">Yes — draft assertion, not validated</option>
                <option value="no">No — horizon must be extended</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Human review date
              <input type="date" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
            </label>
          </div>

          <button type="submit" disabled={busy || !projectionHorizonYears || !stableProfitabilityExpectedWithinHorizon} className="min-h-12 rounded-2xl border-0 bg-sky-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
            {busy ? 'Checking structural package…' : 'Evaluate bank-plan draft structure'}
          </button>
        </form>

        {message ? <div className="mt-4 text-sm font-bold text-slate-700" role="status">{message}</div> : null}
        {evaluation ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs leading-5 text-slate-600">
            <div className="font-black uppercase tracking-[0.08em] text-emerald-700">Structurally complete draft only</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Stable-profitability horizon satisfied', evaluation.stableProfitabilityHorizonRequirementSatisfied],
                ['Market evidence validated', evaluation.marketEvidenceValidated],
                ['Management qualifications verified', evaluation.managementQualificationsVerified],
                ['Projection assumptions validated', evaluation.financialProjectionAssumptionsValidated],
                ['Schedules reconciled', evaluation.projectionSchedulesReconciledToAccountingRecords],
                ['Capital adequacy determined', evaluation.capitalAdequacyDetermined],
                ['Liquidity adequacy determined', evaluation.liquidityAdequacyDetermined],
                ['Board approved', evaluation.boardApproved],
                ['External review complete', evaluation.qualifiedExternalReviewComplete],
                ['Regulator reviewed', evaluation.regulatorReviewed],
                ['Regulator accepted', evaluation.regulatorAccepted],
                ['Charter-application approved', evaluation.approvedForCharterApplication]
              ].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-white p-3"><div className="font-black text-slate-500">{label}</div><div className="mt-1 font-black text-slate-950">{value ? 'Yes' : 'No'}</div></div>)}
            </div>
            <p className="m-0 mt-4">{evaluation.disclosure}</p>
          </div>
        ) : null}

        <p className="m-0 mt-5 text-[11px] leading-5 text-slate-500">{status.disclosure}</p>
      </div>
    </section>
  );
}
