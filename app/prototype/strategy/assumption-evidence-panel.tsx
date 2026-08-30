'use client';

import { FormEvent, useMemo, useState } from 'react';

export type AssumptionEvidenceWorkbenchStatus = {
  slotCount: number;
  businessThesisSlotCount: number;
  unitEconomicsSlotCount: number;
  capitalPlanningSlotCount: number;
  threeYearBankPlanSlotCount: number;
  sponsorDiligenceSlotCount: number;
  evidenceMissingSlotCount: number;
  evidenceAuthenticatedSlotCount: number;
  validatedAssumptionCount: number;
  approvedForSponsorUseCount: number;
  approvedForBoardUseCount: number;
  approvedForCharterUseCount: number;
  persistentEvidenceRepositoryConnected: false;
  automaticEvidenceAuthenticationEnabled: false;
  automaticAssumptionValidationEnabled: false;
  automaticReadinessPromotionEnabled: false;
  slots: ReadonlyArray<{
    id: string;
    domain: 'business-thesis' | 'unit-economics' | 'capital-planning' | 'three-year-bank-plan' | 'sponsor-diligence';
    label: string;
    status: 'evidence-missing';
    evidenceAuthenticated: false;
    assumptionValidated: false;
    approvedForSponsorUse: false;
    approvedForBoardUse: false;
    approvedForCharterUse: false;
    expectation: string;
  }>;
  disclosure: string;
};

type Evaluation = {
  structurallyCompleteForEvidenceReview: true;
  scenarioOnly: boolean;
  evidenceAuthenticated: false;
  evidenceCurrentEnoughForDecisionVerified: false;
  accountableOwnerAssignmentVerified: false;
  qualifiedReviewCompleted: false;
  assumptionValidated: false;
  methodologyApproved: false;
  sensitivityValidated: false;
  downsideCaseValidated: false;
  linkedFinancialSchedulesReconciled: false;
  approvedForInvestorUse: false;
  approvedForSponsorUse: false;
  approvedForBoardUse: false;
  approvedForCharterUse: false;
  readinessPromotionAllowed: false;
  disclosure: string;
};

const evidenceClasses = [
  ['operator-scenario', 'Operator scenario — planning only'],
  ['internal-operating-data', 'Internal operating data — authentication still required'],
  ['provider-quote-or-contract', 'Provider quote / contract — authentication still required'],
  ['external-authoritative-data', 'External authoritative data — relevance/currentness review required'],
  ['qualified-human-analysis', 'Qualified human analysis — scope/authority review required'],
  ['external-authority-record', 'External authority record — software cannot authenticate legal effect']
] as const;

export function AssumptionEvidencePanel({ tenantKey, status }: { tenantKey: string; status: AssumptionEvidenceWorkbenchStatus }) {
  const [slotId, setSlotId] = useState('');
  const [assumptionLabel, setAssumptionLabel] = useState('');
  const [valueOrMethodology, setValueOrMethodology] = useState('');
  const [unitsOrInterpretation, setUnitsOrInterpretation] = useState('');
  const [evidenceClass, setEvidenceClass] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [evidenceAsOf, setEvidenceAsOf] = useState('');
  const [accountableHumanRole, setAccountableHumanRole] = useState('');
  const [qualifiedReviewerRole, setQualifiedReviewerRole] = useState('');
  const [sensitivityRangeOrMethod, setSensitivityRangeOrMethod] = useState('');
  const [downsideCase, setDownsideCase] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [linkedDecisionOrProjection, setLinkedDecisionOrProjection] = useState('');
  const [knownLimitations, setKnownLimitations] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const selected = useMemo(() => status.slots.find((item) => item.id === slotId) ?? null, [slotId, status.slots]);
  const grouped = useMemo(() => {
    const order: AssumptionEvidenceWorkbenchStatus['slots'][number]['domain'][] = ['business-thesis', 'unit-economics', 'capital-planning', 'three-year-bank-plan', 'sponsor-diligence'];
    return order.map((domain) => ({ domain, items: status.slots.filter((item) => item.domain === domain) }));
  }, [status.slots]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slotId || !evidenceClass) return;
    setBusy(true);
    setMessage('');
    setEvaluation(null);
    try {
      const response = await fetch('/api/prototype/assumption-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey,
          candidate: {
            slotId,
            assumptionLabel,
            valueOrMethodology,
            unitsOrInterpretation,
            evidenceClass,
            evidenceReference,
            evidenceAsOf,
            accountableHumanRole,
            qualifiedReviewerRole,
            sensitivityRangeOrMethod,
            downsideCase,
            dependencies,
            linkedDecisionOrProjection,
            knownLimitations,
            reviewedAt
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Assumption evidence review failed.');
      setEvaluation(data.evaluation);
      setMessage('Evidence package is structurally complete only. The assumption remains unvalidated and unapproved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Assumption evidence review failed.');
    } finally {
      setBusy(false);
    }
  }

  const textFields: Array<[string, string, (value: string) => void, string]> = [
    ['Assumption label', assumptionLabel, setAssumptionLabel, 'Name the exact number, rate, behavior, or methodology being used.'],
    ['Value or methodology', valueOrMethodology, setValueOrMethodology, 'State the value/methodology and whether it is measured, quoted, analyzed, or scenario-only.'],
    ['Units / interpretation', unitsOrInterpretation, setUnitsOrInterpretation, 'Explain units, denominator, cohort, period, scope, and interpretation.'],
    ['Evidence reference', evidenceReference, setEvidenceReference, 'Non-sensitive reference only; do not paste private contracts, statements, or personal records.'],
    ['Accountable human role', accountableHumanRole, setAccountableHumanRole, 'Role only. Software does not verify assignment or authority.'],
    ['Qualified reviewer role', qualifiedReviewerRole, setQualifiedReviewerRole, 'Reviewer role/category appropriate to the assumption.'],
    ['Sensitivity range / method', sensitivityRangeOrMethod, setSensitivityRangeOrMethod, 'Describe how low/base/high or sensitivity ranges should be set and sourced.'],
    ['Downside case', downsideCase, setDownsideCase, 'Describe a plausible adverse assumption and why it matters.'],
    ['Dependencies', dependencies, setDependencies, 'Provider terms, product scope, customer behavior, market, staffing, regulation, data availability, etc.'],
    ['Linked decision / projection', linkedDecisionOrProjection, setLinkedDecisionOrProjection, 'Identify which thesis, economics, capital, sponsor, or three-year outputs depend on this assumption.'],
    ['Known limitations', knownLimitations, setKnownLimitations, 'State gaps, stale evidence, uncertainty, sample limitations, unresolved program terms, or other caveats.']
  ];

  return (
    <section className="bg-[#fff9ed] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-amber-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Assumption evidence registry</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Make every important assumption traceable</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              One evidence discipline connects the business thesis, unit economics, capital plan, three-year bank plan, and sponsor diligence. A scenario, quote, contract reference, external data source, or authority record is never treated as authenticated or validated merely because it is entered here.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900">
            {status.evidenceMissingSlotCount}/{status.slotCount} evidence slots missing · {status.validatedAssumptionCount} validated
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          {grouped.map((group) => (
            <div key={group.domain} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{group.domain.replaceAll('-', ' ')}</div>
              <div className="mt-2 grid gap-2">
                {group.items.map((item) => (
                  <button key={item.id} type="button" onClick={() => { setSlotId(item.id); setEvaluation(null); }} className={`rounded-xl border p-3 text-left text-xs font-bold ${slotId === item.id ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    {item.label}
                    <div className="mt-1 text-[10px] font-black uppercase text-rose-600">Evidence missing</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selected ? (
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
            <div className="font-black">{selected.label}</div>
            <div className="mt-1">{selected.expectation}</div>
            <div className="mt-2 font-semibold">Authenticated: No · validated: No · sponsor/board/charter approved: No</div>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
          <b>No automatic truth promotion:</b> {status.evidenceAuthenticatedSlotCount} authenticated evidence slots, {status.approvedForSponsorUseCount} sponsor-approved assumptions, {status.approvedForBoardUseCount} board-approved assumptions, {status.approvedForCharterUseCount} charter-approved assumptions. Private evidence repository connected: No.
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Evidence slot
              <select value={slotId} onChange={(event) => { setSlotId(event.target.value); setEvaluation(null); }} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select a missing evidence slot…</option>
                {status.slots.map((item) => <option key={item.id} value={item.id}>{item.domain} · {item.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Evidence class
              <select value={evidenceClass} onChange={(event) => setEvidenceClass(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select source type…</option>
                {evidenceClasses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {textFields.map(([label, value, setter, placeholder]) => (
              <label key={label} className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {label}
                <textarea value={value} onChange={(event) => setter(event.target.value)} required rows={3} placeholder={placeholder} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950" />
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Evidence as-of date
              <input type="date" value={evidenceAsOf} onChange={(event) => setEvidenceAsOf(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Human review date
              <input type="date" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
            </label>
          </div>

          <button type="submit" disabled={busy || !slotId || !evidenceClass} className="min-h-12 rounded-2xl border-0 bg-amber-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
            {busy ? 'Checking evidence package…' : 'Evaluate assumption evidence package'}
          </button>
        </form>

        {message ? <div className="mt-4 text-sm font-bold text-slate-700" role="status">{message}</div> : null}
        {evaluation ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs leading-5 text-slate-600">
            <div className="font-black uppercase tracking-[0.08em] text-emerald-700">Structurally complete for evidence review only</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Scenario only', evaluation.scenarioOnly],
                ['Evidence authenticated', evaluation.evidenceAuthenticated],
                ['Evidence current enough verified', evaluation.evidenceCurrentEnoughForDecisionVerified],
                ['Owner assignment verified', evaluation.accountableOwnerAssignmentVerified],
                ['Qualified review complete', evaluation.qualifiedReviewCompleted],
                ['Assumption validated', evaluation.assumptionValidated],
                ['Methodology approved', evaluation.methodologyApproved],
                ['Sensitivity validated', evaluation.sensitivityValidated],
                ['Downside validated', evaluation.downsideCaseValidated],
                ['Schedules reconciled', evaluation.linkedFinancialSchedulesReconciled],
                ['Sponsor use approved', evaluation.approvedForSponsorUse],
                ['Board use approved', evaluation.approvedForBoardUse],
                ['Charter use approved', evaluation.approvedForCharterUse],
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
