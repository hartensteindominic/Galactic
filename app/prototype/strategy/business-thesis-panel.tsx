'use client';

import { FormEvent, useState } from 'react';

type ThesisDraft = {
  targetCustomerSegment: string;
  painfulFinancialProblem: string;
  differentiatedMechanism: string;
  distributionAdvantage: string;
  primaryRevenueBeyondInterchange: string;
  evidencePlan: string;
};

type ThesisEvaluation = {
  structurallyCompleteDraft: true;
  thesisStatement: string;
  fields: ThesisDraft;
  validation: {
    customerSegmentValidated: false;
    painfulProblemValidated: false;
    mechanismValidated: false;
    distributionAdvantageValidated: false;
    revenueModelValidated: false;
    evidencePlanExecuted: false;
    marketValidated: false;
  };
  readiness: {
    approvedForPublicClaim: false;
    approvedForInvestorForecast: false;
    approvedForSponsorDiligence: false;
    approvedForCharterBusinessPlan: false;
  };
  disclosure: string;
};

const EMPTY_DRAFT: ThesisDraft = {
  targetCustomerSegment: '',
  painfulFinancialProblem: '',
  differentiatedMechanism: '',
  distributionAdvantage: '',
  primaryRevenueBeyondInterchange: '',
  evidencePlan: ''
};

function ThesisField({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.07em] text-slate-500">
      {label}
      <textarea
        required
        minLength={12}
        maxLength={700}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-28 resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold normal-case leading-6 tracking-normal text-slate-950 outline-none focus:border-indigo-400"
      />
    </label>
  );
}

export function BusinessThesisPanel({ tenantKey }: { tenantKey: string }) {
  const [draft, setDraft] = useState<ThesisDraft>(EMPTY_DRAFT);
  const [evaluation, setEvaluation] = useState<ThesisEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function setField<K extends keyof ThesisDraft>(field: K, value: ThesisDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function evaluate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/prototype/business-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantKey, draft })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Business thesis evaluation failed.');
      setEvaluation(data.evaluation);
      setMessage('Structured draft created. No market, distribution, revenue, sponsor, or charter validation was inferred.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Business thesis evaluation failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-[#f5f7fb] px-4 pb-10 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-white p-5 shadow-[0_16px_50px_rgba(30,41,59,.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-fuchsia-700">Business thesis workbench</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em]">Pass the one-sentence test before scaling the bank idea</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Fill every field with the thesis we actually intend to test. The workbench starts blank and creates only a structured draft; it cannot manufacture product-market fit or regulatory feasibility.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">No defaults · no validation claim</span>
        </div>

        {message ? <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" role="status" aria-live="polite">{message}</div> : null}

        <form onSubmit={evaluate} className="mt-5 grid gap-4 lg:grid-cols-2">
          <ThesisField
            label="Specific customer / distribution segment"
            value={draft.targetCustomerSegment}
            onChange={(value) => setField('targetCustomerSegment', value)}
            placeholder="Who exactly are we serving? Describe a narrow segment or embedded distribution channel we can actually reach."
          />
          <ThesisField
            label="Painful financial problem"
            value={draft.painfulFinancialProblem}
            onChange={(value) => setField('painfulFinancialProblem', value)}
            placeholder="What recurring money problem is painful enough that this segment changes behavior or pays to solve it?"
          />
          <ThesisField
            label="Differentiated mechanism"
            value={draft.differentiatedMechanism}
            onChange={(value) => setField('differentiatedMechanism', value)}
            placeholder="What product, workflow, data, integration, or operating mechanism solves the problem differently from a generic neobank UI?"
          />
          <ThesisField
            label="Distribution advantage"
            value={draft.distributionAdvantage}
            onChange={(value) => setField('distributionAdvantage', value)}
            placeholder="How do we acquire customers efficiently—embedded channel, existing audience, platform partnership, workflow, community, or other repeatable path?"
          />
          <ThesisField
            label="Primary revenue beyond interchange"
            value={draft.primaryRevenueBeyondInterchange}
            onChange={(value) => setField('primaryRevenueBeyondInterchange', value)}
            placeholder="What durable revenue stream matters besides optimistic debit interchange? Keep future regulated products separate until actually approved."
          />
          <ThesisField
            label="Evidence plan"
            value={draft.evidencePlan}
            onChange={(value) => setField('evidencePlan', value)}
            placeholder="What interviews, pilots, conversion tests, provider quotes, retention cohorts, willingness-to-pay tests, or operating data will prove or kill this thesis?"
          />

          <button type="submit" disabled={busy} aria-busy={busy} className="h-12 rounded-2xl border-0 bg-fuchsia-700 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50 lg:col-span-2">
            {busy ? 'Structuring thesis…' : 'Create structured thesis draft'}
          </button>
        </form>

        {evaluation ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]" aria-live="polite">
            <article className="rounded-[22px] border border-fuchsia-100 bg-fuchsia-50 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-fuchsia-700">Structurally complete draft</div>
              <p className="m-0 mt-3 text-base font-black leading-7 text-slate-900">{evaluation.thesisStatement}</p>
              <div className="mt-4 rounded-2xl bg-white/80 p-4 text-xs leading-5 text-slate-600">
                <b>Evidence plan:</b> {evaluation.fields.evidencePlan}
              </div>
            </article>

            <article className="rounded-[22px] border border-amber-200 bg-amber-50 p-5 text-xs leading-5 text-amber-950">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">Still unvalidated</div>
              <div className="mt-3 grid gap-2">
                <div>Customer segment · <b>No</b></div>
                <div>Painful problem · <b>No</b></div>
                <div>Mechanism · <b>No</b></div>
                <div>Distribution advantage · <b>No</b></div>
                <div>Revenue model · <b>No</b></div>
                <div>Evidence plan executed · <b>No</b></div>
                <div>Market validated · <b>No</b></div>
              </div>
              <div className="mt-4 border-t border-amber-200 pt-3">Not approved for public claims, investor forecasts, sponsor diligence, or a charter business plan.</div>
            </article>
          </div>
        ) : null}
      </div>
    </section>
  );
}
