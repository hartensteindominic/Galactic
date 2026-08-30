import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { businessModelThesisControlStatus } from '../../../../lib/business-model-thesis';
import { capitalPlanningControlStatus } from '../../../../lib/capital-planning';
import { charterEvidenceIndexStatus } from '../../../../lib/charter-evidence-index';
import { charterReadinessStatus } from '../../../../lib/charter-readiness';
import { complianceObligationRegisterStatus } from '../../../../lib/compliance-obligation-register';
import { institutionAccountabilityStatus } from '../../../../lib/institution-accountability';
import { plaidSandboxStatus } from '../../../../lib/plaid-sandbox';
import { providerContinuityControlStatus } from '../../../../lib/provider-continuity';
import { prototypeEvidenceFreshnessControlStatus } from '../../../../lib/prototype-evidence-freshness';
import { prototypeIncidentCommunicationControlStatus } from '../../../../lib/prototype-incident-status';
import { prototypeLedgerStatus } from '../../../../lib/prototype-ledger';
import { prototypeMigrationIntegrityStatus } from '../../../../lib/prototype-migration-integrity';
import { prototypeOperationsStatus } from '../../../../lib/prototype-operations';
import { prototypeSchemaPreflightControlStatus } from '../../../../lib/prototype-schema-preflight';
import { sponsorDiligencePackStatus } from '../../../../lib/sponsor-diligence-pack';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';
import { threeYearBankPlanStatus } from '../../../../lib/three-year-bank-plan';
import { unitEconomicsControlStatus } from '../../../../lib/unit-economics';
import { publicBrandConfig } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: url.searchParams.get('tenant')
    });

    return bankingJson({
      ok: true,
      brand: publicBrandConfig(brand),
      charterReadiness: charterReadinessStatus(),
      charterEvidence: charterEvidenceIndexStatus(),
      businessThesis: businessModelThesisControlStatus(),
      unitEconomics: unitEconomicsControlStatus(),
      capitalPlanning: capitalPlanningControlStatus(),
      providerContinuity: providerContinuityControlStatus(),
      complianceApplicability: complianceObligationRegisterStatus(),
      institutionAccountability: institutionAccountabilityStatus(),
      threeYearBankPlan: threeYearBankPlanStatus(),
      sponsorDiligence: sponsorDiligencePackStatus(),
      ledger: prototypeLedgerStatus(),
      bankLink: plaidSandboxStatus(),
      operations: prototypeOperationsStatus(),
      migrationIntegrity: prototypeMigrationIntegrityStatus(),
      schemaPreflight: prototypeSchemaPreflightControlStatus(),
      evidenceFreshness: prototypeEvidenceFreshnessControlStatus(),
      incidentCommunication: prototypeIncidentCommunicationControlStatus(),
      liveBankingEnabled: false,
      mode: 'prototype',
      disclosure: 'White-label prototype only. The future-chartered-bank field is a long-term strategic goal, not a charter application, charter approval, deposit-insurance approval, capital approval, opening authorization, or permission to market Galactic Trust as a bank. The charter evidence index contains no verified regulatory claims and software cannot authenticate authority records or promote regulatory status. The business-thesis workbench can create only a structurally complete draft; it ships with no default niche or revenue model and does not validate customer demand, distribution, revenue, sponsor acceptance, or charter feasibility. The unit-economics engine is scenario-only, contains no industry-default assumptions, and is not an approved forecast, sponsor submission, or charter financial plan. The capital-planning workbench contains no default charter-capital amount: its target is an operator-entered planning assumption, not a regulatory capital requirement or software determination of capital adequacy, source-of-funds authenticity, or charter readiness. The provider-continuity model blocks automatic provider switching, automatic financial-instruction rerouting, and automatic customer-funds migration; no alternate provider/program, production migration execution, data portability, contract-termination review, or provider-exit exercise is represented as approved or verified. The compliance-applicability register uses current official OCC, FFIEC, and OFAC materials as future-bank design sources, but all seeded Galactic applicability decisions remain unassessed, no accountable human owner is represented as assigned, and no policy, operating compliance, independent testing, BSA/AML program, OFAC program, compliance-management system, or examination readiness is represented as approved, operating, or verified. The institution-accountability model leaves every future bank/program role unassigned; AI, Orbit, ChatGPT, autonomous agents, code, and software services cannot act as the bank board, bank officer, BSA/AML officer, compliance owner, internal audit function, organizer, regulator, or sponsor-bank accountable human. A structurally complete assignment candidate does not appoint or qualify anyone. The three-year bank-plan skeleton contains no default market, growth, deposit, revenue, loss, capital, liquidity, or profitability assumptions. Its OCC/FDIC source mapping and completed narrative fields do not validate projections, management, capital/liquidity adequacy, compliance, board approval, regulator review, filing sufficiency, or acceptance. The sponsor-diligence pack contains nineteen evidence sections and no selected sponsor bank or BaaS provider. All section completion, evidence authentication, human attestation, sponsor review/acceptance, contract approval, data-flow approval, provider certification, and live-program approval counts/states remain zero or false. The diligence endpoint cannot submit anything, attest as a human, impersonate an applicant or sponsor, or promote readiness. The customer/problem/distribution/revenue thesis, bank-level economics, capital plan, provider-exit plan, human governance, three-year plan, sponsor diligence, and legal/compliance applicability remain unvalidated. Repository migration fingerprints and read-only schema capability observation do not prove Supabase migration execution/order, data correctness, recovery, or production approval. Evidence recency does not prove continuous monitoring or production health, and the incident-communication model is not a production status page or exercised customer-communications program. Real deposits, payments, cards, KYC/AML, production provider webhooks, and banking rails remain disabled until an approved regulated program is configured.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
