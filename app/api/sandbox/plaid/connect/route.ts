import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { connectOneClickSandboxBank } from '../../../../../lib/plaid-sandbox';
import { requireJsonRequest, requireTrustedOrigin } from '../../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);

    const body = await request.json() as { tenantKey?: string };
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    const linked = await connectOneClickSandboxBank({ tenantKey: brand.key });
    return bankingJson({ ok: true, linked });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
