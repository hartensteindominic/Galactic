import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { calculateCapitalPlanningScenario, type CapitalPlanningScenario, capitalPlanningControlStatus } from '../../../../lib/capital-planning';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CapitalPlanningRequest = {
  tenantKey?: string;
  scenario?: CapitalPlanningScenario;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<CapitalPlanningRequest>(request, 16_384);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    if (!body.scenario || typeof body.scenario !== 'object') {
      return bankingJson(
        {
          ok: false,
          error: {
            code: 'CAPITAL_PLANNING_SCENARIO_REQUIRED',
            message: 'A capital-planning scenario is required.'
          }
        },
        400
      );
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: capitalPlanningControlStatus(),
      result: calculateCapitalPlanningScenario(body.scenario),
      persisted: false,
      disclosure: 'Operator-only planning arithmetic. Inputs and results are not persisted by this endpoint and do not establish regulatory capital adequacy, source-of-funds authenticity, fundraising readiness, or charter-application readiness.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
