'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BusinessThesisPanel } from './business-thesis-panel';
import { CapitalPlanningPanel } from './capital-planning-panel';
import { ComplianceApplicabilityPanel, type ComplianceWorkbenchStatus } from './compliance-applicability-panel';
import { StrategyConsole } from './strategy-console';

type SessionState = 'checking' | 'open-memory-demo' | 'authenticated' | 'login-required' | 'configuration-locked';

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

export function StrategyShell({
  tenantKey,
  brandName,
  charter,
  economicsControls,
  compliance
}: {
  tenantKey: string;
  brandName: string;
  charter: CharterStatus;
  economicsControls: EconomicsControls;
  compliance: ComplianceWorkbenchStatus;
}) {
  const [state, setState] = useState<SessionState>('checking');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const sessionUrl = `/api/prototype/operator/session?tenant=${encodeURIComponent(tenantKey)}`;

  async function checkSession() {
    const response = await fetch(sessionUrl, { cache: 'no-store' });
    const data = await response.json();
    if (response.ok && data?.mode === 'open-memory-demo') {
      setState('open-memory-demo');
      return;
    }
    if (response.ok && data?.authenticated) {
      setState('authenticated');
      return;
    }
    if (data?.error?.code === 'OPERATOR_ACCESS_NOT_CONFIGURED' || data?.error?.code === 'OPERATOR_ACCESS_SECRET_TOO_WEAK') {
      setState('configuration-locked');
      setMessage(data.error.message);
      return;
    }
    setState('login-required');
  }

  useEffect(() => {
    checkSession().catch(() => {
      setState('login-required');
      setMessage('Operator session could not be verified.');
    });
  }, [sessionUrl]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessSecret = secret;
    setSecret('');
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(sessionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessSecret })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error?.message || 'Operator sign-in failed.');
      setState('authenticated');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Operator sign-in failed.');
      setState('login-required');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await fetch(sessionUrl, { method: 'DELETE' });
    } finally {
      setMessage('Operator session closed.');
      setState('login-required');
      setBusy(false);
    }
  }

  const workspace = (
    <>
      <StrategyConsole
        tenantKey={tenantKey}
        brandName={brandName}
        charter={charter}
        economicsControls={economicsControls}
      />
      <BusinessThesisPanel tenantKey={tenantKey} />
      <CapitalPlanningPanel tenantKey={tenantKey} />
      <ComplianceApplicabilityPanel tenantKey={tenantKey} status={compliance} />
    </>
  );

  if (state === 'authenticated') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          className="fixed right-4 top-4 z-[60] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-lg disabled:opacity-50"
        >
          Sign out
        </button>
        {workspace}
      </div>
    );
  }

  if (state === 'open-memory-demo') return workspace;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-lg rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(30,41,59,.10)] sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Strategy access</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800">Planning only</span>
        </div>
        <h1 className="m-0 mt-5 text-3xl font-black tracking-[-0.05em]">{brandName} strategy lab</h1>
        <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
          Charter-readiness, thesis drafting, scenario economics, capital planning, and compliance-applicability review are restricted behind the same prototype operator session as operational evidence.
        </p>

        {state === 'checking' ? <p className="mt-6 text-sm font-semibold text-slate-600">Checking operator session…</p> : null}

        {state === 'configuration-locked' ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <b>Strategy lab is locked.</b>
            <div className="mt-1">{message || 'Configure the server-only prototype operator access secret privately before exposing operator-only planning tools.'}</div>
          </div>
        ) : null}

        {state === 'login-required' ? (
          <form onSubmit={signIn} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              Prototype operator access secret
              <input
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                required
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-950 outline-none focus:border-indigo-400"
              />
            </label>
            <button type="submit" disabled={busy} className="h-12 rounded-2xl border border-0 bg-indigo-600 px-5 text-sm font-black text-white shadow-lg disabled:opacity-50">
              {busy ? 'Signing in…' : 'Open strategy lab'}
            </button>
          </form>
        ) : null}

        {message && state === 'login-required' ? <div className="mt-4 text-sm font-semibold text-rose-700" role="status">{message}</div> : null}

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          This prototype session is not production workforce identity or a regulatory approval workflow. Thesis/economics/capital/compliance-review outputs are not persisted and do not become validated market evidence, legal applicability determinations, approved policies, operating compliance evidence, regulator-reviewed capital plans, sponsor submissions, examination results, or charter-application materials merely because they were produced here.
        </div>

        <a href={`/prototype?tenant=${encodeURIComponent(tenantKey)}`} className="mt-5 inline-block text-sm font-black text-indigo-700 no-underline">← Back to banking demo</a>
      </div>
    </main>
  );
}
