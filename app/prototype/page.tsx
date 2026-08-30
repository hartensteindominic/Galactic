import { headers } from 'next/headers';
import { publicBrandConfig, resolveBrand } from '../../lib/white-label';
import { PrototypeDashboard } from './prototype-dashboard';

export default async function PrototypePage({
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

  return <PrototypeDashboard initialBrand={publicBrandConfig(brand)} />;
}
