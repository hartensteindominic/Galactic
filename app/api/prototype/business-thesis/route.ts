import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { evaluateBusinessModelThesis, type BusinessModelThesisDraft, businessModelThesisControlStatus } from '../../../../lib/business-model-thesis';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BusinessThesisRequest = {
  tenantKey?: string;
  draft?: BusinessModelThesisDraft;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<BusinessThesisRequest>(request, 16_384);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    if (!body.draft || typeof body.draft !== 'object') {
      return bankingJson(
        {
          ok: false,
          error: {
            code: 'BUSINESS_MODEL_THESIS_REQUIRED',
            message: 'A complete business-model thesis draft is required.'
          }
        },
        400
      );
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: businessModelThesisControlStatus(),
      evaluation: evaluateBusinessModelThesis(body.draft),
      persisted: false,
      disclosure: 'Operator-only strategy workbench. Draft text is not persisted by this endpoint and structural completeness does not equal market, sponsor, legal, regulatory, or charter validation.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
