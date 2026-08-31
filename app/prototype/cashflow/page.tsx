import { headers } from 'next/headers';
import { resolveRequestBrand } from '../../../lib/tenant-boundary';
import { publicBrandConfig } from '../../../lib/white-label';
import { CashflowConsole } from './cashflow-console';

export default async function PrototypeCashflowPage({
  searchParams
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const brand = resolveRequestBrand({
    host: requestHeaders.get('host'),
    requestedKey: params.tenant
  });

  return <CashflowConsole tenantKey={brand.key} brandName={publicBrandConfig(brand).name} />;
}
