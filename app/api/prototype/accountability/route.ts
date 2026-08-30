import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { evaluateAccountabilityAssignmentCandidate, institutionAccountabilityStatus, type AccountabilityAssignmentCandidate } from '../../../../lib/institution-accountability';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AccountabilityRequest = {
  tenantKey?: string;
  candidate?: AccountabilityAssignmentCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<AccountabilityRequest>(request, 24_576);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'ACCOUNTABILITY_CANDIDATE_REQUIRED', message: 'A proposed accountability-assignment package is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: institutionAccountabilityStatus(),
      evaluation: evaluateAccountabilityAssignmentCandidate(body.candidate),
      persisted: false,
      disclosure: 'Operator-only planning endpoint. It does not appoint a person or function, verify identity or qualifications, create authority, approve board/governance action, establish independence, or satisfy sponsor/regulator requirements.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
