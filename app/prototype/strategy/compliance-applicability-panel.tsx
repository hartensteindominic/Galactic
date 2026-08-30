'use client';

import { FormEvent, useMemo, useState } from 'react';

type ComplianceSource = {
  id: string;
  authority: string;
  title: string;
  publicationOrVersion: string;
  canonicalUrl: string;
  currentSourceChecked: true;
  createsGalacticApplicabilityByItself: false;
};

type ComplianceObligation = {
  id: string;
  domain: string;
  label: string;
  sourceIds: string[];
  candidateScope: 'future-bank-candidate';
  applicabilityStatus: 'unassessed';
  humanApplicabilityDecisionRequired: true;
  qualifiedLegalComplianceReviewRequired: true;
  accountableHumanRoleAssigned: false;
  policyApproved: false;
  operatingEvidenceVerified: false;
  independentTestingVerified: false;
  sourceExpectation: string;
  galacticObligationDetermined: false;
};

type ComplianceStatus = {
  sourceRegistryReviewedAt: string;
  officialSourceCount: number;
  obligationCount: number;
  unresolvedApplicabilityCount: number;
  accountableOwnerAssignedCount: number;
  approvedPolicyCount: number;
  verifiedOperatingEvidenceCount: number;
  verifiedIndependentTestingCount: number;
  qualifiedLegalComplianceApplicabilityReviewComplete: false;
  complianceResponsibilityMatrixAssigned: false;
  productionComplianceManagementSystemOperating: false;
  productionBsaAmlProgramOperating: false;
  productionOfacProgramOperating: false;
  softwareCanSelfCertifyCompliance: false;
  examinationReady: false;
  sources: ComplianceSource[];
  obligations: ComplianceObligation[];
  disclosure: string;
};

type Evaluation = {
  candidate: {
    obligationId: string;
    proposedDecision: 'applicable' | 'not-applicable' | 'deferred';
    entityRole: string;
    products: string[];
    jurisdictions: string[];
    rationale: string;
    sourceIds: string[];
    accountableRole: string;
    reviewerRole: string;
    reviewedAt: string;
    evidenceReference: string | null;
  };
  structurallyCompleteForQualifiedReview: true;
  softwareVerifiedLegalApplicability: false;
  softwareVerifiedRegulatoryInterpretation: false;
  softwareVerifiedAccountableOwnerAssignment: false;
  softwareVerifiedPolicyApproval: false;
  softwareVerifiedOperatingCompliance: false;
  softwareVerifiedIndependentTesting: false;
  readinessPromotionAllowed: false;
  qualifiedHumanReviewRequired: true;
  disclosure: string;
};

function lines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pill(value: boolean, yes = 'Yes', no = 'No') {
  return value ? yes : no;
}

export function ComplianceApplicabilityPanel({ tenantKey, status }: { tenantKey: string; status: ComplianceStatus }) {
  const [obligationId, setObligationId] = useState('');
  const [proposedDecision, setProposedDecision] = useState('');
  const [entityRole, setEntityRole] = useState('');
  const [products, setProducts] = useState('');
  const [jurisdictions, setJurisdictions] = useState('');
  const [rationale, setRationale] = useState('');
  const [accountableRole, setAccountableRole] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const selected = useMemo(
    () => status.obligations.find((item) => item.id === obligationId) ?? null,
    [obligationId, status.obligations]
  );
  const selectedSources = useMemo(
    () => selected ? status.sources.filter((source) => selected.sourceIds.includes(source.id)) : [],
    [selected, status.sources]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !proposedDecision) return;
    setBusy(true);
    setMessage('');
    setEvaluation(null);
    try {
      const response = await fetch('/api/prototype/compliance-applicability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey,
          candidate: {
            obligationId: selected.id,
            proposedDecision,
            entityRole,
            products: lines(products),
            jurisdictions: lines(jurisdictions),
            rationale,
            sourceIds: selected.sourceIds,
            accountableRole,
            reviewerRole,
            reviewedAt,
            evidenceReference: evidenceReference || undefined
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Compliance applicability review failed.');
      setEvaluation(data.evaluation);
      setMessage('Review package is structurally complete. Qualified human review is still required.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Compliance applicability review failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#eef2ff] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-indigo-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-700">Compliance workbench · planning only</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Applicability + accountable ownership</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Turn an unresolved future-bank control into a structured package for qualified review. This tool does not determine law, certify compliance, appoint an officer, approve a policy, or make Galactic examination-ready.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900">
            {status.unresolvedApplicabilityCount}/{status.obligationCount} applicability decisions unresolved
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Assigned owners', status.accountableOwnerAssignedCount],
            ['Approved policies', status.approvedPolicyCount],
            ['Operating evidence', status.verifiedOperatingEvidenceCount],
            ['Independent tests', status.verifiedIndependentTestingCount]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
          <b>Not operating / not verified:</b> compliance-management system, BSA/AML program, OFAC program, responsibility matrix, qualified legal/compliance applicability review, independent compliance testing, and examination readiness.
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Unresolved obligation
              <select
                value={obligationId}
                onChange={(event) => { setObligationId(event.target.value); setEvaluation(null); }}
                required
                className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950"
              >
                <option value="">Select an obligation…</option>
                {status.obligations.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Proposed human-review decision
              <select
                value={proposedDecision}
                onChange={(event) => setProposedDecision(event.target.value)}
                required
                className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950"
              >
                <option value="">Select a proposed decision…</option>
                <option value="applicable">Applicable — proposed, not verified</option>
                <option value="not-applicable">Not applicable — proposed, not verified</option>
                <option value="deferred">Deferred — facts/structure unresolved</option>
              </select>
            </label>
          </div>

          {selected ? (
            <div className="rounded-2xl bg-indigo-50 p-4 text-xs leading-5 text-indigo-950">
              <div className="font-black">{selected.label}</div>
              <div className="mt-1">{selected.sourceExpectation}</div>
              <div className="mt-3 font-black">Current official source mapping</div>
              <ul className="mt-1 list-disc pl-5">
                {selectedSources.map((source) => (
                  <li key={source.id}>{source.authority} · {source.title} · {source.publicationOrVersion}</li>
                ))}
              </ul>
              <div className="mt-2 font-semibold">Source mapping ≠ Galactic applicability.</div>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              ['Actual/proposed entity role', entityRole, setEntityRole, 'Describe Galactic’s legal/program role for this review; do not assume a charter.'],
              ['Products/activities', products, setProducts, 'One per line or comma-separated.'],
              ['Jurisdictions', jurisdictions, setJurisdictions, 'One per line or comma-separated.'],
              ['Accountable role', accountableRole, setAccountableRole, 'Role only; do not put sensitive personnel information here.'],
              ['Qualified reviewer role', reviewerRole, setReviewerRole, 'Example category: qualified bank regulatory counsel/compliance adviser.'],
              ['Private evidence reference (optional)', evidenceReference, setEvidenceReference, 'Reference only—do not paste private evidence into this public-repo tool.']
            ].map(([label, value, setter, placeholder]) => (
              <label key={String(label)} className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {label as string}
                <textarea
                  value={value as string}
                  onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                  required={!String(label).includes('optional')}
                  rows={3}
                  placeholder={placeholder as string}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950"
                />
              </label>
            ))}
          </div>

          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            Applicability rationale / open conditions
            <textarea
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              required
              rows={5}
              placeholder="State the facts, assumptions, unresolved questions, and why the proposed decision should be reviewed."
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950"
            />
          </label>

          <label className="grid max-w-sm gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            Human review date
            <input
              type="date"
              value={reviewedAt}
              onChange={(event) => setReviewedAt(event.target.value)}
              required
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950"
            />
          </label>

          <button
            type="submit"
            disabled={busy || !selected || !proposedDecision}
            className="min-h-12 rounded-2xl border-0 bg-indigo-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50"
          >
            {busy ? 'Checking package…' : 'Build qualified-review package'}
          </button>
        </form>

        {message ? <div className="mt-4 text-sm font-bold text-slate-700" role="status">{message}</div> : null}

        {evaluation ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-black uppercase tracking-[0.08em] text-emerald-700">Structurally complete for qualified review</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Legal applicability verified', evaluation.softwareVerifiedLegalApplicability],
                ['Interpretation verified', evaluation.softwareVerifiedRegulatoryInterpretation],
                ['Owner assignment verified', evaluation.softwareVerifiedAccountableOwnerAssignment],
                ['Policy approval verified', evaluation.softwareVerifiedPolicyApproval],
                ['Operating compliance verified', evaluation.softwareVerifiedOperatingCompliance],
                ['Independent testing verified', evaluation.softwareVerifiedIndependentTesting],
                ['Readiness promoted', evaluation.readinessPromotionAllowed],
                ['Human review required', evaluation.qualifiedHumanReviewRequired]
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl bg-white p-3">
                  <div className="text-[11px] font-black text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-black">{pill(Boolean(value))}</div>
                </div>
              ))}
            </div>
            <p className="m-0 mt-4 text-xs leading-5 text-slate-500">{evaluation.disclosure}</p>
          </div>
        ) : null}

        <p className="m-0 mt-5 text-[11px] leading-5 text-slate-500">
          Official-source registry last reviewed {status.sourceRegistryReviewedAt}. It is intentionally incomplete and must expand with the actual entity, charter/partner structure, products, customer types, jurisdictions, money flows, vendors, data flows, lending/card/payment activities, and marketing claims.
        </p>
      </div>
    </section>
  );
}
