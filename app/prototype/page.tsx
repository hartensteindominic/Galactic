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

  return (
    <div className="relative">
      <a
        href={`/prototype/operations?tenant=${encodeURIComponent(brand.key)}`}
        className="fixed bottom-4 right-4 z-50 rounded-2xl bg-[#0b153d] px-4 py-3 text-xs font-black text-white no-underline shadow-xl"
      >
        Operations health →
      </a>
      <PrototypeDashboard initialBrand={publicBrandConfig(brand)} />
    </div>
  );
}
