'use client';

import { FormEvent, useState } from 'react';

export type SponsorDiligenceWorkbenchStatus = {
  officialSourceBaselineReviewedAt: string;
  sectionCount: number;
  completedSectionCount: number;
  evidenceVerifiedSectionCount: number;
  humanAttestedSectionCount: number;
  sponsorReviewedSectionCount: number;
  sponsorAcceptedSectionCount: number;
  selectedSponsorBank: null;
  selectedBaasProvider: null;
  exactProgramScopeApproved: false;
  exactResponsibilityAllocationApproved: false;
  contractsApproved: false;
  dataFlowsApproved: false;
  liveCustomerDataApproved: false;
  productionProviderCertificationComplete: false;
  sponsorProgramApprovalComplete: false;
  automaticSubmissionEnabled: false;
  softwareAttestationEnabled: false;
  applicantImpersonationEnabled: false;
  sponsorImpersonationEnabled: false;
  readyForSponsorSubmission: false;
  readyForLiveProgram: false;
  sections: ReadonlyArray<{
    id: string;
    label: string;
    category: string;
    status: 'evidence-required';
    humanAttestationRequired: true;
    sponsorReviewRequired: true;
    evidenceVerified: false;
    humanAttestationVerified: false;
    sponsorAccepted: false;
    expectation: string;
  }>;
  disclosure: string;
};

type Evaluation = {
  structurallyCompleteForHumanDiligenceReview: true;
  evidenceAuthenticated: false;
  humanAttestationVerified: false;
  legalComplianceSufficiencyVerified: false;
  financialConditionVerified: false;
  controlOperationVerified: false;
  independentTestingVerified: false;
  sponsorReviewed: false;
  sponsorAccepted: false;
  contractApproved: false;
  programApproved: false;
  liveCustomerDataApproved: false;
  liveFinancialActivityApproved: false;
  automaticSubmissionAllowed: false;
  softwareMayAttestAsHuman: false;
  softwareMayImpersonateApplicant: false;
  softwareMayImpersonateSponsor: false;
  readinessPromotionAllowed: false;
  disclosure: string;
};

function lines(value: string) {
  return value.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean);
}

export function SponsorDiligencePanel({ tenantKey, status }: { tenantKey: string; status: SponsorDiligenceWorkbenchStatus }) {
  const [sectionId, setSectionId] = useState('');
  const [proposedProgramRole, setProposedProgramRole] = useState('');
  const [responseSummary, setResponseSummary] = useState('');
  const [evidenceReferences, setEvidenceReferences] = useState('');
  const [accountableHumanRole, setAccountableHumanRole] = useState('');
  const [attestingHumanRole, setAttestingHumanRole] = useState('');
  const [qualifiedReviewerRole, setQualifiedReviewerRole] = useState('');
  const [materialExceptions, setMaterialExceptions] = useState('');
  const [remediationOrFollowUp, setRemediationOrFollowUp] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const selected = status.sections.find((item) => item.id === sectionId) ?? null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMessage('');
    setEvaluation(null);
    try {
      const response = await fetch('/api/prototype/sponsor-diligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey,
          candidate: {
            sectionId: selected.id,
            proposedProgramRole,
            responseSummary,
            evidenceReferences: lines(evidenceReferences),
            accountableHumanRole,
            attestingHumanRole,
            qualifiedReviewerRole,
            materialExceptions,
            remediationOrFollowUp,
            reviewedAt
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Sponsor diligence review failed.');
      setEvaluation(data.evaluation);
      setMessage('Draft package is structurally complete for human diligence review. Nothing was submitted or approved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sponsor diligence review failed.');
    } finally {
      setBusy(false);
    }
  }

  const fields: Array<[string, string, (value: string) => void, string]> = [
    ['Proposed program role', proposedProgramRole, setProposedProgramRole, 'Describe the proposed role and responsibility allocation without assuming a sponsor or approval.'],
    ['Response summary', responseSummary, setResponseSummary, 'Give a factual response. Separate implemented software from exercised controls and external evidence.'],
    ['Evidence references', evidenceReferences, setEvidenceReferences, 'One non-sensitive reference per line. Do not paste private diligence materials.'],
    ['Accountable human role', accountableHumanRole, setAccountableHumanRole, 'Role that owns the underlying control/fact. Software cannot fill this role.'],
    ['Attesting human role', attestingHumanRole, setAttestingHumanRole, 'Authorized human role that could truthfully attest through the actual sponsor process.'],
    ['Qualified reviewer role', qualifiedReviewerRole, setQualifiedReviewerRole, 'Reviewer role/category. Entering it does not prove review occurred.'],
    ['Material exceptions / gaps', materialExceptions, setMaterialExceptions, 'State every known gap, unverified item, dependency, or exception.'],
    ['Remediation / follow-up', remediationOrFollowUp, setRemediationOrFollowUp, 'State the evidence or action required before this section could be accepted.']
  ];

  return (
    <section className="bg-[#f7f4ff] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-violet-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">Sponsor diligence · evidence + human attestation</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Build the evidence pack without pretending it was approved</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Prepare factual sponsor/BaaS diligence responses, evidence references, human ownership, exceptions, and remediation. This workbench cannot select a sponsor, authenticate evidence, attest as a human, submit a questionnaire, or approve a program.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900">
            {status.completedSectionCount}/{status.sectionCount} complete · {status.sponsorAcceptedSectionCount} sponsor accepted
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Evidence verified', status.evidenceVerifiedSectionCount],
            ['Human attested', status.humanAttestedSectionCount],
            ['Sponsor reviewed', status.sponsorReviewedSectionCount],
            ['Sponsor accepted', status.sponsorAcceptedSectionCount],
            ['Live approved', status.readyForLiveProgram ? 1 : 0]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black">{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
          <b>No selected sponsor/program:</b> sponsor bank = none · BaaS provider = none · program scope approval = No · contracts = No · data flows = No · provider certification = No · automatic submission = No.
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {status.sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => { setSectionId(section.id); setEvaluation(null); }}
              className={`rounded-2xl border p-4 text-left ${sectionId === section.id ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{section.category.replaceAll('-', ' ')}</div>
              <div className="mt-1 text-sm font-black">{section.label}</div>
              <div className="mt-2 text-xs font-bold text-amber-700">Evidence required · human attestation required</div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-xs leading-5 text-violet-950">
            <div className="font-black">{selected.label}</div>
            <div className="mt-1">{selected.expectation}</div>
            <div className="mt-2 font-semibold">Evidence verified: No · human attestation verified: No · sponsor accepted: No</div>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            Diligence section
            <select value={sectionId} onChange={(event) => setSectionId(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
              <option value="">Select a section…</option>
              {status.sections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}
            </select>
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            {fields.map(([label, value, setter, placeholder]) => (
              <label key={label} className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {label}
                <textarea value={value} onChange={(event) => setter(event.target.value)} required rows={3} placeholder={placeholder} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950" />
              </label>
            ))}
          </div>

          <label className="grid max-w-sm gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            Human review date
            <input type="date" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
          </label>

          <button type="submit" disabled={busy || !selected} className="min-h-12 rounded-2xl border-0 bg-violet-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
            {busy ? 'Checking draft package…' : 'Build human diligence review package'}
          </button>
        </form>

        {message ? <div className="mt-4 text-sm font-bold text-slate-700" role="status">{message}</div> : null}

        {evaluation ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs leading-5 text-slate-600">
            <div className="font-black uppercase tracking-[0.08em] text-emerald-700">Structurally complete only · not submitted</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Evidence authenticated', evaluation.evidenceAuthenticated],
                ['Human attestation verified', evaluation.humanAttestationVerified],
                ['Legal/compliance sufficiency', evaluation.legalComplianceSufficiencyVerified],
                ['Financial condition verified', evaluation.financialConditionVerified],
                ['Control operation verified', evaluation.controlOperationVerified],
                ['Independent testing verified', evaluation.independentTestingVerified],
                ['Sponsor reviewed', evaluation.sponsorReviewed],
                ['Sponsor accepted', evaluation.sponsorAccepted],
                ['Contract approved', evaluation.contractApproved],
                ['Program approved', evaluation.programApproved],
                ['Live customer data approved', evaluation.liveCustomerDataApproved],
                ['Live financial activity approved', evaluation.liveFinancialActivityApproved],
                ['Automatic submission', evaluation.automaticSubmissionAllowed],
                ['Software may attest', evaluation.softwareMayAttestAsHuman],
                ['Applicant impersonation', evaluation.softwareMayImpersonateApplicant],
                ['Sponsor impersonation', evaluation.softwareMayImpersonateSponsor]
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-white p-3">
                  <div className="font-black text-slate-500">{label}</div>
                  <div className="mt-1 font-black text-slate-950">{value ? 'Yes' : 'No'}</div>
                </div>
              ))}
            </div>
            <p className="m-0 mt-4">{evaluation.disclosure}</p>
          </div>
        ) : null}

        <p className="m-0 mt-5 text-[11px] leading-5 text-slate-500">Official-source baseline reviewed {status.officialSourceBaselineReviewedAt}. {status.disclosure}</p>
      </div>
    </section>
  );
}
