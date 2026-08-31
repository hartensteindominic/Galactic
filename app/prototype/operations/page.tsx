import { headers } from 'next/headers';
import { resolveRequestBrand } from '../../../lib/tenant-boundary';
import { OperationsShell } from './operations-shell';

export default async function PrototypeOperationsPage({
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

  return <OperationsShell tenantKey={brand.key} brandName={brand.name} />;
}
