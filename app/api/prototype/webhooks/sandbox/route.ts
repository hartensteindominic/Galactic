import { BankingError } from '../../../../../lib/banking';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { prototypeOperationsStatus, recordPrototypeProviderEvent, verifyPrototypeWebhookSecret } from '../../../../../lib/prototype-operations';
import { readJsonBodyLimited, requireJsonRequest } from '../../../../../lib/request-security';
import { resolveAuthenticatedServerTenant } from '../../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireJsonRequest(request);

    const status = prototypeOperationsStatus();
    if (!status.databaseConfigured) {
      throw new BankingError(503, 'PERSISTENT_LEDGER_REQUIRED', 'Configure the prototype Supabase ledger before using the webhook inbox.');
    }
    if (!process.env.PROTOTYPE_WEBHOOK_SECRET?.trim()) {
      throw new BankingError(503, 'WEBHOOK_SECRET_NOT_CONFIGURED', 'The prototype webhook inbox is disabled until its server-side secret is configured.');
    }

    const presentedSecret = request.headers.get('x-prototype-webhook-secret') || '';
    if (!verifyPrototypeWebhookSecret(presentedSecret)) {
      throw new BankingError(401, 'INVALID_WEBHOOK_AUTH', 'Sandbox webhook authentication failed.');
    }

    const body = await readJsonBodyLimited<{
      tenantKey?: string;
      eventId?: string;
      eventType?: string;
      payload?: unknown;
    }>(request, 131_072);

    const brand = resolveAuthenticatedServerTenant(body.tenantKey);

    const event = await recordPrototypeProviderEvent({
      tenantKey: brand.key,
      providerEventId: String(body.eventId || ''),
      eventType: String(body.eventType || ''),
      payload: body.payload ?? null
    });

    return bankingJson({
      ok: true,
      event,
      simulationOnly: true,
      disclosure: 'Prototype sandbox webhook recorded for an explicitly authenticated tenant. This route is not a production Plaid or BaaS webhook verifier.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
