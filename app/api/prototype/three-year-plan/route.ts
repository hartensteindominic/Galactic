import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';
import { evaluateThreeYearBankPlanCandidate, threeYearBankPlanStatus, type ThreeYearBankPlanCandidate } from '../../../../lib/three-year-bank-plan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ThreeYearPlanRequest = {
  tenantKey?: string;
  candidate?: ThreeYearBankPlanCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<ThreeYearPlanRequest>(request, 65_536);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'THREE_YEAR_PLAN_CANDIDATE_REQUIRED', message: 'A three-year bank-plan draft is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: threeYearBankPlanStatus(),
      evaluation: evaluateThreeYearBankPlanCandidate(body.candidate),
      persisted: false,
      disclosure: 'Operator-only structural planning endpoint. It does not create a regulator-ready business plan, validate projections, verify management, determine capital or liquidity adequacy, obtain board approval, file an application, or obtain regulator acceptance.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
