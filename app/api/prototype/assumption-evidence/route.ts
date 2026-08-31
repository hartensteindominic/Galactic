import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { evaluateAssumptionEvidenceCandidate, assumptionEvidenceRegistryStatus, type AssumptionEvidenceCandidate } from '../../../../lib/assumption-evidence-registry';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AssumptionEvidenceRequest = {
  tenantKey?: string;
  candidate?: AssumptionEvidenceCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<AssumptionEvidenceRequest>(request, 32_768);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'ASSUMPTION_EVIDENCE_CANDIDATE_REQUIRED', message: 'An assumption-evidence candidate is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: assumptionEvidenceRegistryStatus(),
      evaluation: evaluateAssumptionEvidenceCandidate(body.candidate),
      persisted: false,
      disclosure: 'Operator-only planning endpoint. It checks structural completeness but does not authenticate evidence, validate an assumption or methodology, verify a human owner/reviewer, reconcile financial schedules, approve forecasts, or create sponsor/board/regulator acceptance.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
