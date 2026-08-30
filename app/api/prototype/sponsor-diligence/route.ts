import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { evaluateSponsorDiligenceResponseCandidate, sponsorDiligencePackStatus, type SponsorDiligenceResponseCandidate } from '../../../../lib/sponsor-diligence-pack';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SponsorDiligenceRequest = {
  tenantKey?: string;
  candidate?: SponsorDiligenceResponseCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<SponsorDiligenceRequest>(request, 32_768);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'SPONSOR_DILIGENCE_CANDIDATE_REQUIRED', message: 'A sponsor-diligence response package is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: sponsorDiligencePackStatus(),
      evaluation: evaluateSponsorDiligenceResponseCandidate(body.candidate),
      persisted: false,
      submitted: false,
      disclosure: 'Operator-only diligence drafting endpoint. It does not authenticate evidence, create a human attestation, submit information to a sponsor, approve a contract, obtain sponsor/program approval, authorize live customer data, or authorize live financial activity.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
