import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';
import { evaluateThreeYearBankPlanCandidate, threeYearBankPlanStatus, type ThreeYearBankPlanCandidate } from '../../../../lib/three-year-bank-plan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ThreeYearBankPlanRequest = {
  tenantKey?: string;
  candidate?: ThreeYearBankPlanCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<ThreeYearBankPlanRequest>(request, 65_536);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'THREE_YEAR_BANK_PLAN_REQUIRED', message: 'A bank-plan candidate is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: threeYearBankPlanStatus(),
      evaluation: evaluateThreeYearBankPlanCandidate(body.candidate),
      persisted: false,
      disclosure: 'Operator-only planning endpoint. Structural completeness is not regulator readiness. No input becomes a filed, board-approved, regulator-reviewed, accepted, or legally effective business plan merely because this endpoint evaluates it.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
