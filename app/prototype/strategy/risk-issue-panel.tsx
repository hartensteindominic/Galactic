'use client';

import { FormEvent, useState } from 'react';

export type RiskIssueWorkbenchStatus = {
  riskIssueManagementModelAvailable: true;
  productionIssueRepositoryConnected: false;
  recordedPrototypeIssueCount: number;
  recordedOpenIssueCount: number;
  productionIssueInventoryCompletenessVerified: false;
  productionRemediationSlaApproved: false;
  productionEscalationMatrixApproved: false;
  productionIndependentVerificationWorkflowOperating: false;
  automaticRiskAcceptanceAllowed: false;
  automaticIssueClosureAllowed: false;
  softwareMayCloseIssue: false;
  softwareMayAcceptResidualRisk: false;
  unresolvedHighCriticalBlocksLaunchByDefault: true;
  unresolvedMoneyMovementOrLedgerIssueBlocksLiveFinancialActivityByDefault: true;
  greenCiCountsAsIssueRemediation: false;
  codeFixCountsAsIssueClosure: false;
  readyForProductionIssueManagement: false;
  disclosure: string;
};

type Evaluation = {
  structurallyCompleteForHumanIssueReview: true;
  severityRequiresEnhancedGovernance: boolean;
  externalFinding: boolean;
  independentVerificationRequired: boolean;
  externalClosureEvidencePotentiallyRequired: boolean;
  evidenceAuthenticated: false;
  accountableOwnerAssignmentVerified: false;
  containmentEffectivenessVerified: false;
  rootCauseValidated: false;
  remediationImplementedVerified: false;
  independentVerificationCompleted: false;
  customerRemediationCompleted: false;
  residualRiskAcceptanceApproved: false;
  sponsorClosureAccepted: false;
  regulatorClosureAccepted: false;
  launchRestrictionCleared: false;
  moneyMovementRestrictionCleared: false;
  automaticRiskAcceptanceAllowed: false;
  automaticIssueClosureAllowed: false;
  softwareMayCloseIssue: false;
  issueClosed: false;
  readinessPromotionAllowed: false;
  disclosure: string;
};

function list(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

const sources = [
  ['internal-control-test', 'Internal control test'],
  ['incident', 'Incident'],
  ['customer-complaint-or-dispute', 'Customer complaint / dispute'],
  ['independent-audit-or-assurance', 'Independent audit / assurance'],
  ['security-or-privacy-test', 'Security / privacy test'],
  ['vendor-or-provider-monitoring', 'Vendor / provider monitoring'],
  ['sponsor-program-finding', 'Sponsor-program finding'],
  ['regulator-or-examiner-finding', 'Regulator / examiner finding'],
  ['financial-reconciliation', 'Financial reconciliation'],
  ['legal-or-compliance-review', 'Legal / compliance review'],
  ['management-self-identified', 'Management self-identified']
] as const;

const states = [
  ['identified', 'Identified'],
  ['triaged', 'Triaged'],
  ['remediation-in-progress', 'Remediation in progress'],
  ['pending-independent-verification', 'Pending independent verification'],
  ['verified-remediated', 'Verified-remediated — proposed only'],
  ['risk-acceptance-proposed', 'Risk acceptance proposed — not approved']
] as const;

export function RiskIssuePanel({ tenantKey, status }: { tenantKey: string; status: RiskIssueWorkbenchStatus }) {
  const [source, setSource] = useState('');
  const [severity, setSeverity] = useState('');
  const [proposedState, setProposedState] = useState('');
  const [issueLabel, setIssueLabel] = useState('');
  const [affectedProductsOrProcesses, setAffectedProductsOrProcesses] = useState('');
  const [affectedControlIds, setAffectedControlIds] = useState('');
  const [jurisdictions, setJurisdictions] = useState('');
  const [description, setDescription] = useState('');
  const [customerImpact, setCustomerImpact] = useState('');
  const [financialImpact, setFinancialImpact] = useState('');
  const [legalComplianceSponsorImpact, setLegalComplianceSponsorImpact] = useState('');
  const [immediateContainment, setImmediateContainment] = useState('');
  const [rootCauseOrHypothesis, setRootCauseOrHypothesis] = useState('');
  const [remediationPlan, setRemediationPlan] = useState('');
  const [accountableHumanOwnerRole, setAccountableHumanOwnerRole] = useState('');
  const [independentVerifierRole, setIndependentVerifierRole] = useState('');
  const [targetRemediationDate, setTargetRemediationDate] = useState('');
  const [evidenceReferences, setEvidenceReferences] = useState('');
  const [externalFindingReference, setExternalFindingReference] = useState('');
  const [residualRisk, setResidualRisk] = useState('');
  const [customerRemediationAssessment, setCustomerRemediationAssessment] = useState('');
  const [launchOrMoneyMovementImpact, setLaunchOrMoneyMovementImpact] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!source || !severity || !proposedState) return;
    setBusy(true);
    setMessage('');
    setEvaluation(null);
    try {
      const response = await fetch('/api/prototype/risk-issue-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey,
          candidate: {
            issueLabel,
            source,
            severity,
            proposedState,
            affectedProductsOrProcesses: list(affectedProductsOrProcesses),
            affectedControlIds: list(affectedControlIds),
            jurisdictions: list(jurisdictions),
            description,
            customerImpact,
            financialImpact,
            legalComplianceSponsorImpact,
            immediateContainment,
            rootCauseOrHypothesis,
            remediationPlan,
            accountableHumanOwnerRole,
            independentVerifierRole,
            targetRemediationDate,
            evidenceReferences: list(evidenceReferences),
            externalFindingReference: externalFindingReference || undefined,
            residualRisk,
            customerRemediationAssessment,
            launchOrMoneyMovementImpact,
            reviewedAt
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Risk issue review failed.');
      setEvaluation(data.evaluation);
      setMessage('Issue package is structurally complete for human review. Nothing was closed, accepted, or cleared.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Risk issue review failed.');
    } finally {
      setBusy(false);
    }
  }

  const fields: Array<[string, string, (value: string) => void, string]> = [
    ['Issue label', issueLabel, setIssueLabel, 'Short, specific finding title.'],
    ['Affected products / processes', affectedProductsOrProcesses, setAffectedProductsOrProcesses, 'One per line or comma-separated.'],
    ['Affected control IDs', affectedControlIds, setAffectedControlIds, 'One per line; reference actual control identifiers where available.'],
    ['Jurisdictions', jurisdictions, setJurisdictions, 'Actual/proposed jurisdictions; applicability remains subject to qualified review.'],
    ['Description', description, setDescription, 'What happened or what was found? Keep facts separate from hypotheses.'],
    ['Customer impact', customerImpact, setCustomerImpact, 'State known/unknown impact and assessment work still needed.'],
    ['Financial impact', financialImpact, setFinancialImpact, 'State known/unknown exposure, reconciliation, loss, or accounting implications.'],
    ['Legal / compliance / sponsor impact', legalComplianceSponsorImpact, setLegalComplianceSponsorImpact, 'State actual questions and external dependencies without inventing conclusions.'],
    ['Immediate containment', immediateContainment, setImmediateContainment, 'What is being contained now? Effectiveness remains unverified until tested.'],
    ['Root cause / hypothesis', rootCauseOrHypothesis, setRootCauseOrHypothesis, 'Label hypotheses as hypotheses until validated.'],
    ['Remediation plan', remediationPlan, setRemediationPlan, 'Concrete corrective actions, dependencies, rollout, rollback, and verification plan.'],
    ['Accountable human owner role', accountableHumanOwnerRole, setAccountableHumanOwnerRole, 'Role only; software does not assign or verify the owner.'],
    ['Independent verifier role', independentVerifierRole, setIndependentVerifierRole, 'Verifier must be sufficiently independent for the issue.'],
    ['Evidence references', evidenceReferences, setEvidenceReferences, 'Non-sensitive references only; do not paste restricted findings or customer data.'],
    ['External finding reference (optional)', externalFindingReference, setExternalFindingReference, 'Reference only for sponsor/regulator/audit records; no private content.'],
    ['Residual risk', residualRisk, setResidualRisk, 'What risk remains after the proposed remediation?'],
    ['Customer remediation assessment', customerRemediationAssessment, setCustomerRemediationAssessment, 'Assess affected population, refunds/reimbursement/notices and other remediation as applicable.'],
    ['Launch / money-movement impact', launchOrMoneyMovementImpact, setLaunchOrMoneyMovementImpact, 'State whether launch, feature availability, or money movement should remain blocked pending review.']
  ];

  return (
    <section className="bg-[#fff4f4] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-rose-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">Findings + remediation · no auto-close</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">A fix is not closed until the evidence says it is</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Structure control failures, incidents, complaints, audit/security findings, reconciliation breaks, sponsor findings, or regulator findings. The software can organize the package; it cannot close the issue or accept residual risk.
            </p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-black leading-5 text-rose-900">
            Production issue inventory connected: No
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Prototype-recorded issues', status.recordedPrototypeIssueCount],
            ['Prototype-recorded open', status.recordedOpenIssueCount],
            ['Inventory complete', status.productionIssueInventoryCompletenessVerified ? 'Yes' : 'No'],
            ['Production-ready', status.readyForProductionIssueManagement ? 'Yes' : 'No']
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-black">{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
          <b>Inventory truth:</b> zero prototype-recorded issues does not mean “no issues exist.” No authoritative production issue repository is connected and completeness is unverified. Green CI = not remediation. Code fix = not closure.
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Source
              <select value={source} onChange={(event) => setSource(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select finding source…</option>
                {sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Severity
              <select value={severity} onChange={(event) => setSeverity(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select severity…</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Proposed state
              <select value={proposedState} onChange={(event) => setProposedState(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select proposed state…</option>
                {states.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {fields.map(([label, value, setter, placeholder]) => (
              <label key={label} className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {label}
                <textarea value={value} onChange={(event) => setter(event.target.value)} required={!label.includes('optional')} rows={3} placeholder={placeholder} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950" />
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Target remediation date
              <input type="date" value={targetRemediationDate} onChange={(event) => setTargetRemediationDate(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Human review date
              <input type="date" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
            </label>
          </div>

          <button type="submit" disabled={busy || !source || !severity || !proposedState} className="min-h-12 rounded-2xl border-0 bg-rose-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
            {busy ? 'Checking issue package…' : 'Evaluate issue / remediation package'}
          </button>
        </form>

        {message ? <div className="mt-4 text-sm font-bold text-slate-700" role="status">{message}</div> : null}

        {evaluation ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs leading-5 text-slate-600">
            <div className="font-black uppercase tracking-[0.08em] text-emerald-700">Structurally complete for human issue review only</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Enhanced governance', evaluation.severityRequiresEnhancedGovernance],
                ['External finding', evaluation.externalFinding],
                ['Evidence authenticated', evaluation.evidenceAuthenticated],
                ['Owner verified', evaluation.accountableOwnerAssignmentVerified],
                ['Containment verified', evaluation.containmentEffectivenessVerified],
                ['Root cause validated', evaluation.rootCauseValidated],
                ['Remediation verified', evaluation.remediationImplementedVerified],
                ['Independent verification', evaluation.independentVerificationCompleted],
                ['Customer remediation complete', evaluation.customerRemediationCompleted],
                ['Residual risk accepted', evaluation.residualRiskAcceptanceApproved],
                ['Sponsor closure accepted', evaluation.sponsorClosureAccepted],
                ['Regulator closure accepted', evaluation.regulatorClosureAccepted],
                ['Launch restriction cleared', evaluation.launchRestrictionCleared],
                ['Money movement cleared', evaluation.moneyMovementRestrictionCleared],
                ['Issue closed', evaluation.issueClosed],
                ['Readiness promoted', evaluation.readinessPromotionAllowed]
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
