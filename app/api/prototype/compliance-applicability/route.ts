import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { evaluateComplianceApplicabilityCandidate, type ComplianceApplicabilityCandidate } from '../../../../lib/compliance-obligation-register';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ComplianceApplicabilityRequest = {
  tenantKey?: string;
  candidate?: ComplianceApplicabilityCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<ComplianceApplicabilityRequest>(request, 24_576);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({
        ok: false,
        error: {
          code: 'COMPLIANCE_APPLICABILITY_CANDIDATE_REQUIRED',
          message: 'A compliance applicability review candidate is required.'
        }
      }, 400);
    }

    const evaluation = evaluateComplianceApplicabilityCandidate(body.candidate);

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      evaluation,
      persisted: false,
      disclosure: 'Operator-only planning review. A structurally complete package is not a legal applicability determination, policy approval, compliance certification, examination conclusion, license, sponsor approval, or authorization to launch live financial services. Qualified accountable humans must review the actual entity, products, jurisdictions, customers, vendors, and activities.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
