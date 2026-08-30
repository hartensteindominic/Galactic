import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { recordPrototypeOperatorAuditEvent, runPrototypeReconciliation } from '../../../../lib/prototype-operations';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    const operator = requirePrototypeOperator(request);

    const body = await readJsonBodyLimited<{ tenantKey?: string }>(request, 4_096);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    const reconciliation = await runPrototypeReconciliation(brand.key);
    const audit = operator.authenticated
      ? await recordPrototypeOperatorAuditEvent({
          tenantKey: brand.key,
          action: 'operator.reconciliation_requested',
          entityType: 'profile',
          entityId: reconciliation.user_external_id,
          resultStatus: reconciliation.status,
          reconciliationSource: reconciliation.source
        })
      : { persisted: false, mode: 'memory' as const };

    return bankingJson({
      ok: true,
      reconciliation,
      operatorAuditEvidencePersisted: audit.persisted,
      disclosure: 'Simulation reconciliation only. Persistent evidence requires an authenticated prototype operator session and host-bound tenant resolution. Operator audit evidence is sanitized and contains no submitted access secret. No real money moved.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
