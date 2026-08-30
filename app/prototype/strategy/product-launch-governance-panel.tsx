'use client';

import { useState } from 'react';

export type ProductLaunchGovernanceWorkbenchStatus = {
  launchGovernanceModelAvailable: true;
  requiredGateCount: number;
  satisfiedGateCount: number;
  evidenceVerifiedGateCount: number;
  humanApprovedGateCount: number;
  externallyApprovedGateCount: number;
  operatingControlVerifiedGateCount: number;
  defaultRiskClassification: 'unclassified';
  defaultLaunchState: 'blocked-unverified';
  automaticLaunchEnablementAllowed: false;
  automaticLiveWriteEnablementAllowed: false;
  automaticLegalApprovalAllowed: false;
  automaticSponsorProgramApprovalAllowed: false;
  softwareReleaseApprovalAllowed: false;
  greenCiCountsAsLaunchApproval: false;
  completedPlanningDraftCountsAsLaunchApproval: false;
  selectedSponsorRelationshipCountsAsBlanketApproval: false;
  conditionalCharterApprovalCountsAsOpeningAuthority: false;
  launchApproved: false;
  liveFinancialActivityApproved: false;
  productionLaunchProcessApproved: false;
  productionChangeManagementProcessOperating: false;
  productionPostLaunchMonitoringOperating: false;
  gates: ReadonlyArray<{
    id: string;
    label: string;
    category: string;
    requiredForLiveLaunch: true;
    status: 'blocked-unverified';
    accountableHumanRequired: true;
    qualifiedReviewRequired: true;
    evidenceVerified: false;
    humanApprovalVerified: false;
    externalApprovalVerified: false;
    operatingControlVerified: false;
    launchGateSatisfied: false;
    expectation: string;
  }>;
  disclosure: string;
};

export function ProductLaunchGovernancePanel({ status }: { status: ProductLaunchGovernanceWorkbenchStatus }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const blocked = status.requiredGateCount - status.satisfiedGateCount;

  return (
    <section className="bg-[#fff8ed] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-amber-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Launch governance · fail closed</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">A green build is not permission to launch money movement</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              New financial products and material changes stay blocked until every applicable gate has real evidence, accountable humans, qualified review, exercised controls, and external/program approval where required.
            </p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-black leading-5 text-rose-900">
            {blocked}/{status.requiredGateCount} launch gates blocked
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Satisfied', status.satisfiedGateCount],
            ['Evidence verified', status.evidenceVerifiedGateCount],
            ['Human approved', status.humanApprovedGateCount],
            ['External approved', status.externallyApprovedGateCount],
            ['Operating verified', status.operatingControlVerifiedGateCount]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black">{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
          <b>Launch status: BLOCKED.</b> Automatic launch = No · automatic live writes = No · software legal approval = No · software sponsor approval = No · software release approval = No · live financial activity approved = No.
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {status.gates.map((gate, index) => {
            const isExpanded = expanded === gate.id;
            return (
              <button
                key={gate.id}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : gate.id)}
                aria-expanded={isExpanded}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-100 text-[11px] font-black text-rose-700">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{gate.category.replaceAll('-', ' ')}</span>
                    <span className="mt-1 block text-sm font-black">{gate.label}</span>
                    <span className="mt-2 block text-xs font-bold text-rose-700">Blocked · evidence unverified · human approval unverified</span>
                    {isExpanded ? <span className="mt-3 block text-xs leading-5 text-slate-600">{gate.expectation}</span> : null}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
          <b>Important:</b> `not-applicable` is never an automatic escape hatch. The review model only accepts <code>not-applicable-proposed</code>, which still requires qualified human review. A selected sponsor relationship and a conditional charter milestone are also explicitly not blanket launch authority.
        </div>

        <p className="m-0 mt-5 text-[11px] leading-5 text-slate-500">{status.disclosure}</p>
      </div>
    </section>
  );
}
