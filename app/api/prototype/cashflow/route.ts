import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { getPrototypeCashflowForecast } from '../../../../lib/prototype-cashflow';
import { resolveBrand } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const brand = resolveBrand({
      host: request.headers.get('host'),
      key: url.searchParams.get('tenant')
    });

    const reserve = Number(url.searchParams.get('reserve'));
    const reserveCents = Number.isFinite(reserve) ? Math.round(reserve * 100) : undefined;
    const forecast = await getPrototypeCashflowForecast({
      tenantKey: brand.key,
      reserveCents
    });

    return bankingJson({ ok: true, forecast });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
