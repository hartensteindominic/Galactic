'use client';

import { FormEvent, useState } from 'react';

export type AccountabilityWorkbenchStatus = {
  roleCount: number;
  assignedRoleCount: number;
  verifiedQualifiedRoleCount: number;
  responsibilityMatrixAssigned: false;
  readyForSponsorProgramResponsibilitySignoff: false;
  readyForCharterGovernanceSubmission: false;
  roles: ReadonlyArray<{
    id: string;
    label: string;
    category: string;
    assignmentStatus: 'unassigned';
    qualifiedHumanRequired: true;
    aiMayServeAsAccountableOwner: false;
    softwareMayServeAsAccountableOwner: false;
    expectation: string;
  }>;
  disclosure: string;
};

type Evaluation = {
  structurallyCompleteForHumanGovernanceReview: true;
  assignmentVerified: false;
  qualificationsVerified: false;
  authorityVerified: false;
  independenceVerified: false;
  boardOrGovernanceApprovalVerified: false;
  regulatorOrSponsorAcceptanceVerified: false;
  readinessPromotionAllowed: false;
  aiCanServeAsNamedAccountableOwner: false;
  softwareCanServeAsNamedAccountableOwner: false;
  humanGovernanceReviewRequired: true;
  disclosure: string;
};

function splitReferences(value: string) {
  return value.split(/\n|,/).map((entry) => entry.trim()).filter(Boolean);
}

export function AccountabilityPanel({ tenantKey, status }: { tenantKey: string; status: AccountabilityWorkbenchStatus }) {
  const [roleId, setRoleId] = useState('');
  const [actorClass, setActorClass] = useState('');
  const [proposedRoleTitle, setProposedRoleTitle] = useState('');
  const [proposedOrganization, setProposedOrganization] = useState('');
  const [qualificationsSummary, setQualificationsSummary] = useState('');
  const [authoritySummary, setAuthoritySummary] = useState('');
  const [independenceSummary, setIndependenceSummary] = useState('');
  const [evidenceReferences, setEvidenceReferences] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const selected = status.roles.find((item) => item.id === roleId) ?? null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleId || !actorClass) return;
    setBusy(true);
    setMessage('');
    setEvaluation(null);
    try {
      const response = await fetch('/api/prototype/accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantKey,
          candidate: {
            roleId,
            actorClass,
            proposedRoleTitle,
            proposedOrganization,
            qualificationsSummary,
            authoritySummary,
            independenceSummary,
            evidenceReferences: splitReferences(evidenceReferences),
            reviewerRole,
            reviewedAt
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Accountability review failed.');
      setEvaluation(data.evaluation);
      setMessage('Assignment package is structurally complete for human governance review. No appointment or authority was created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Accountability review failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">Institution accountability · human authority only</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Who is actually accountable?</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Every future bank/program role is unassigned until real people or human-led functions are qualified, authorized, documented, and reviewed. AI and software can assist but cannot be the accountable regulated actor.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900">
            {status.assignedRoleCount}/{status.roleCount} roles assigned · {status.verifiedQualifiedRoleCount} qualified/verified
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {status.roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => { setRoleId(role.id); setEvaluation(null); }}
              className={`rounded-2xl border p-4 text-left ${roleId === role.id ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{role.category.replaceAll('-', ' ')}</div>
              <div className="mt-1 text-sm font-black">{role.label}</div>
              <div className="mt-2 text-xs font-bold text-amber-700">Unassigned</div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4 text-xs leading-5 text-violet-950">
            <div className="font-black">{selected.label}</div>
            <div className="mt-1">{selected.expectation}</div>
            <div className="mt-2 font-semibold">Qualified human required · AI owner: No · software owner: No</div>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Role
              <select value={roleId} onChange={(event) => setRoleId(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select an unassigned role…</option>
                {status.roles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Proposed actor class
              <select value={actorClass} onChange={(event) => setActorClass(event.target.value)} required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950">
                <option value="">Select a human governance class…</option>
                <option value="human-individual">Human individual</option>
                <option value="human-committee">Human committee</option>
                <option value="independent-human-led-function">Independent human-led function</option>
                <option value="regulated-partner-human-function">Regulated-partner human function</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              ['Proposed role title', proposedRoleTitle, setProposedRoleTitle, 'Role title only. Do not enter sensitive personal information.'],
              ['Proposed organization/function', proposedOrganization, setProposedOrganization, 'Actual or proposed employing/contracting function.'],
              ['Qualifications summary', qualificationsSummary, setQualificationsSummary, 'Describe what evidence exists; software does not verify it.'],
              ['Authority/resources summary', authoritySummary, setAuthoritySummary, 'Reporting line, escalation rights, resources, budget/authority as applicable.'],
              ['Independence/conflicts summary', independenceSummary, setIndependenceSummary, 'Explain independence, challenge rights, dual-hatting, and conflicts.'],
              ['Evidence references', evidenceReferences, setEvidenceReferences, 'One reference per line; do not paste private evidence into the public-repo tool.'],
              ['Qualified reviewer role', reviewerRole, setReviewerRole, 'Reviewer role/category, not legal approval generated by software.']
            ].map(([label, value, setter, placeholder]) => (
              <label key={String(label)} className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {label as string}
                <textarea value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} required rows={3} placeholder={placeholder as string} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-slate-950" />
              </label>
            ))}
          </div>

          <label className="grid max-w-sm gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            Human review date
            <input type="date" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} required className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950" />
          </label>

          <button type="submit" disabled={busy || !roleId || !actorClass} className="min-h-12 rounded-2xl border-0 bg-violet-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
            {busy ? 'Checking package…' : 'Build human-governance review package'}
          </button>
        </form>

        {message ? <div className="mt-4 text-sm font-bold text-slate-700" role="status">{message}</div> : null}
        {evaluation ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs leading-5 text-slate-600">
            <div className="font-black uppercase tracking-[0.08em] text-emerald-700">Structurally complete only</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Assignment verified', evaluation.assignmentVerified],
                ['Qualifications verified', evaluation.qualificationsVerified],
                ['Authority verified', evaluation.authorityVerified],
                ['Independence verified', evaluation.independenceVerified],
                ['Governance approval verified', evaluation.boardOrGovernanceApprovalVerified],
                ['Sponsor/regulator acceptance', evaluation.regulatorOrSponsorAcceptanceVerified],
                ['Readiness promoted', evaluation.readinessPromotionAllowed],
                ['Human review required', evaluation.humanGovernanceReviewRequired]
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
