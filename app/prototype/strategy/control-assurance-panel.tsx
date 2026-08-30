'use client';

import { useState } from 'react';

export type ControlAssuranceWorkbenchStatus = {
  mapAvailable: true;
  controlCount: number;
  designReferenceCount: number;
  accountableOwnerVerifiedCount: number;
  controlDesignApprovedCount: number;
  operatingEvidenceVerifiedCount: number;
  independentTestingVerifiedCount: number;
  remediationVerifiedCount: number;
  sponsorAcceptedCount: number;
  boardOrGovernanceApprovedCount: number;
  launchGateSatisfiedCount: number;
  softwareMayActAsControlOwner: false;
  softwareMayActAsIndependentTester: false;
  softwareMayCloseFindings: false;
  automaticOperatingEffectivenessPromotionEnabled: false;
  automaticLaunchGatePromotionEnabled: false;
  productionControlAssuranceProgramOperating: false;
  controls: ReadonlyArray<{
    id: string;
    label: string;
    domain: string;
    accountableRoleIds: string[];
    complianceObligationIds: string[];
    sponsorDiligenceSectionIds: string[];
    launchGateIds: string[];
    assumptionEvidenceSlotIds: string[];
    status: 'design-reference-only';
    accountableOwnerVerified: false;
    controlDesignApproved: false;
    operatingEvidenceVerified: false;
    independentTestingVerified: false;
    remediationVerified: false;
    sponsorAccepted: false;
    boardOrGovernanceApproved: false;
    launchGateSatisfied: false;
    expectation: string;
  }>;
  disclosure: string;
};

export function ControlAssurancePanel({ status }: { status: ControlAssuranceWorkbenchStatus }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="bg-[#f1f7ff] px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[30px] border border-sky-100 bg-white p-5 shadow-[0_20px_60px_rgba(30,41,59,.08)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Control assurance · evidence traceability</div>
            <h2 className="m-0 mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">Show what proves a control actually works</h2>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Each control maps to accountable human roles, compliance obligations, sponsor diligence, assumption evidence, and launch gates. Mapping is not verification: operating effectiveness and independent testing stay false until real evidence is authenticated and reviewed.
            </p>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-xs font-black leading-5 text-sky-900">
            {status.controlCount} design references · {status.operatingEvidenceVerifiedCount} operating verified
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Owners verified', status.accountableOwnerVerifiedCount],
            ['Designs approved', status.controlDesignApprovedCount],
            ['Operating verified', status.operatingEvidenceVerifiedCount],
            ['Independent tests', status.independentTestingVerifiedCount],
            ['Remediation verified', status.remediationVerifiedCount]
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black">{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
          <b>Assurance not operating:</b> software control owner = No · software independent tester = No · automatic finding closure = No · automatic operating-effectiveness promotion = No · automatic launch-gate promotion = No.
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {status.controls.map((control) => {
            const isExpanded = expanded === control.id;
            return (
              <button
                key={control.id}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : control.id)}
                aria-expanded={isExpanded}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">{control.domain.replaceAll('-', ' ')}</div>
                <div className="mt-1 text-sm font-black">{control.label}</div>
                <div className="mt-2 text-xs font-bold text-amber-700">Design reference only · operating evidence unverified</div>
                <div className="mt-2 text-[11px] leading-5 text-slate-500">
                  {control.accountableRoleIds.length} owner-role mapping · {control.complianceObligationIds.length} compliance link · {control.sponsorDiligenceSectionIds.length} diligence link · {control.launchGateIds.length} launch link
                </div>
                {isExpanded ? (
                  <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600">
                    <div><b>Expected evidence:</b> {control.expectation}</div>
                    <div><b>Mapped owner roles:</b> {control.accountableRoleIds.join(', ')}</div>
                    <div><b>Compliance obligations:</b> {control.complianceObligationIds.join(', ') || 'none mapped'}</div>
                    <div><b>Sponsor diligence:</b> {control.sponsorDiligenceSectionIds.join(', ') || 'none mapped'}</div>
                    <div><b>Launch gates:</b> {control.launchGateIds.join(', ')}</div>
                    <div><b>Assumption evidence:</b> {control.assumptionEvidenceSlotIds.join(', ') || 'none mapped'}</div>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
          A code test can support software evidence, but it does not by itself prove deployment/configuration, control population completeness, human review, exception handling, period-long operation, or independent testing. Findings stay open until an authorized evidence process verifies closure.
        </div>

        <p className="m-0 mt-5 text-[11px] leading-5 text-slate-500">{status.disclosure}</p>
      </div>
    </section>
  );
}
