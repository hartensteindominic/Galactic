import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { charterEvidenceIndexStatus } from '../../../../lib/charter-evidence-index';
import { charterReadinessStatus } from '../../../../lib/charter-readiness';
import { plaidSandboxStatus } from '../../../../lib/plaid-sandbox';
import { prototypeEvidenceFreshnessControlStatus } from '../../../../lib/prototype-evidence-freshness';
import { prototypeIncidentCommunicationControlStatus } from '../../../../lib/prototype-incident-status';
import { prototypeLedgerStatus } from '../../../../lib/prototype-ledger';
import { prototypeMigrationIntegrityStatus } from '../../../../lib/prototype-migration-integrity';
import { prototypeOperationsStatus } from '../../../../lib/prototype-operations';
import { prototypeSchemaPreflightControlStatus } from '../../../../lib/prototype-schema-preflight';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';
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
      unitEconomics: unitEconomicsControlStatus(),
      ledger: prototypeLedgerStatus(),
      bankLink: plaidSandboxStatus(),
      operations: prototypeOperationsStatus(),
      migrationIntegrity: prototypeMigrationIntegrityStatus(),
      schemaPreflight: prototypeSchemaPreflightControlStatus(),
      evidenceFreshness: prototypeEvidenceFreshnessControlStatus(),
      incidentCommunication: prototypeIncidentCommunicationControlStatus(),
      liveBankingEnabled: false,
      mode: 'prototype',
      disclosure: 'White-label prototype only. The future-chartered-bank field is a long-term strategic goal, not a charter application, charter approval, deposit-insurance approval, capital approval, opening authorization, or permission to market Galactic Trust as a bank. The charter evidence index contains no verified regulatory claims and software cannot authenticate authority records or promote regulatory status. The unit-economics engine is scenario-only, contains no industry-default assumptions, and is not an approved forecast, sponsor submission, or charter financial plan. The customer/problem/distribution/revenue thesis and bank-level economics remain unvalidated. Repository migration fingerprints and read-only schema capability observation do not prove Supabase migration execution/order, data correctness, recovery, or production approval. Evidence recency does not prove continuous monitoring or production health, and the incident-communication model is not a production status page or exercised customer-communications program. Real deposits, payments, cards, KYC/AML, production provider webhooks, and banking rails remain disabled until an approved regulated program is configured.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
