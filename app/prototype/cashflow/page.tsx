import { headers } from 'next/headers';
import { publicBrandConfig, resolveBrand } from '../../../lib/white-label';
import { CashflowConsole } from './cashflow-console';

export default async function PrototypeCashflowPage({
  searchParams
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const brand = resolveBrand({
    host: requestHeaders.get('host'),
    key: params.tenant
  });

  return <CashflowConsole tenantKey={brand.key} brandName={publicBrandConfig(brand).name} />;
}
