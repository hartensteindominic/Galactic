import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { createPrototypeTransfer } from '../../../../lib/prototype-ledger';
import { requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveBrand } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);

    const body = await request.json() as {
      tenantKey?: string;
      fromAccountId?: string;
      recipient?: string;
      amount?: number;
      memo?: string;
    };

    const brand = resolveBrand({
      host: request.headers.get('host'),
      key: body.tenantKey
    });

    const amount = Number(body.amount);
    const transfer = await createPrototypeTransfer({
      tenantKey: brand.key,
      fromAccountId: String(body.fromAccountId || ''),
      recipient: String(body.recipient || ''),
      amountCents: Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN,
      memo: typeof body.memo === 'string' ? body.memo : undefined,
      idempotencyKey: request.headers.get('idempotency-key') || ''
    });

    return bankingJson({ ok: true, transfer });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
