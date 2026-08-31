import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { currentThirdPartyInventory, thirdPartyInventoryStatus, UNSELECTED_REGULATED_VENDOR_CATEGORIES } from '../../../../lib/third-party-inventory';
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

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      inventory: currentThirdPartyInventory(),
      unselectedRegulatedVendorCategories: UNSELECTED_REGULATED_VENDOR_CATEGORIES,
      status: thirdPartyInventoryStatus()
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
