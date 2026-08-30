import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { evaluateRiskIssueCandidate, riskIssueManagementStatus, type RiskIssueCandidate } from '../../../../lib/risk-issue-management';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RiskIssueReviewRequest = {
  tenantKey?: string;
  candidate?: RiskIssueCandidate;
};

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);
    const body = await readJsonBodyLimited<RiskIssueReviewRequest>(request, 49_152);
    const brand = resolveRequestBrand({ host: request.headers.get('host'), requestedKey: body.tenantKey });

    if (!body.candidate || typeof body.candidate !== 'object') {
      return bankingJson({ ok: false, error: { code: 'RISK_ISSUE_CANDIDATE_REQUIRED', message: 'A risk issue/remediation candidate is required.' } }, 400);
    }

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: riskIssueManagementStatus(),
      evaluation: evaluateRiskIssueCandidate(body.candidate),
      persisted: false,
      disclosure: 'Operator-only structural review endpoint. It does not persist a production finding, authenticate evidence, verify remediation, approve risk acceptance, complete independent testing, clear a launch or money-movement restriction, or close an internal, sponsor, audit, security, compliance, or regulator issue.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
