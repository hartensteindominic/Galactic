import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { controlAssuranceMapStatus, evaluateControlAssuranceCandidate, type ControlAssuranceCandidate } from '../../../../lib/control-assurance-map';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ControlAssuranceRequest = {
  tenantKey?: string;
  candidate?: ControlAssuranceCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<ControlAssuranceRequest>(request, 32_768);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'CONTROL_ASSURANCE_CANDIDATE_REQUIRED', message: 'A control assurance package is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: controlAssuranceMapStatus(),
      evaluation: evaluateControlAssuranceCandidate(body.candidate),
      persisted: false,
      findingClosed: false,
      launchGateChanged: false,
      disclosure: 'Operator-only structural assurance review. It does not authenticate evidence or human attestations, approve control design, verify operating effectiveness, establish independent-testing sufficiency, close findings, verify remediation, obtain sponsor/board acceptance, satisfy a launch gate, or authorize live financial activity.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
