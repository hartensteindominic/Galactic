import { headers } from 'next/headers';
import { resolveBrand } from '../../../lib/white-label';
import { OperationsShell } from './operations-shell';

export default async function PrototypeOperationsPage({
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

  return <OperationsShell tenantKey={brand.key} brandName={brand.name} />;
}
