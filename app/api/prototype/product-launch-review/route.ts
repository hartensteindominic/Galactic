import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { evaluateProductLaunchReviewCandidate, productLaunchGovernanceStatus, type ProductLaunchReviewCandidate } from '../../../../lib/product-launch-governance';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProductLaunchReviewRequest = {
  tenantKey?: string;
  candidate?: ProductLaunchReviewCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<ProductLaunchReviewRequest>(request, 131_072);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'PRODUCT_LAUNCH_REVIEW_REQUIRED', message: 'A product launch review package is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: productLaunchGovernanceStatus(),
      evaluation: evaluateProductLaunchReviewCandidate(body.candidate),
      persisted: false,
      launchApproved: false,
      liveFinancialActivityApproved: false,
      productionWritesChanged: false,
      disclosure: 'Operator-only structural launch review. This endpoint does not authenticate evidence, determine law, approve sponsor/program scope, appoint accountable humans, approve terms or controls, enable production writes, create a human release decision, or authorize a financial product launch.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
