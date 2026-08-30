import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { buildPrototypeBillGuard } from '../../../../lib/prototype-bill-guard';
import { getPrototypeCashflowForecast } from '../../../../lib/prototype-cashflow';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: url.searchParams.get('tenant')
    });

    const reserve = Number(url.searchParams.get('reserve'));
    const reserveCents = Number.isFinite(reserve) ? Math.round(reserve * 100) : undefined;
    const forecast = await getPrototypeCashflowForecast({
      tenantKey: brand.key,
      reserveCents
    });
    const billGuard = buildPrototypeBillGuard(forecast);

    return bankingJson({ ok: true, forecast, billGuard });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
