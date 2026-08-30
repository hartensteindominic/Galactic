import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';
import { calculateUnitEconomics, type UnitEconomicsScenario, unitEconomicsControlStatus } from '../../../../lib/unit-economics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UnitEconomicsRequest = {
  tenantKey?: string;
  scenario?: UnitEconomicsScenario;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<UnitEconomicsRequest>(request, 16_384);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    if (!body.scenario || typeof body.scenario !== 'object') {
      return bankingJson(
        {
          ok: false,
          error: {
            code: 'UNIT_ECONOMICS_SCENARIO_REQUIRED',
            message: 'A unit-economics scenario is required.'
          }
        },
        { status: 400 }
      );
    }

    const result = calculateUnitEconomics(body.scenario);

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: unitEconomicsControlStatus(),
      result,
      persisted: false,
      disclosure: 'Operator-only planning calculation. Scenario inputs are not persisted and are not treated as market facts, approved forecasts, sponsor-bank economics, or charter-application financial projections.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
