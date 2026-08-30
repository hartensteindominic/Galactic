import { headers } from 'next/headers';
import { resolveRequestBrand } from '../../lib/tenant-boundary';
import { publicBrandConfig } from '../../lib/white-label';
import { PrototypeDashboard } from './prototype-dashboard';

export default async function PrototypePage({
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
  const tenant = encodeURIComponent(brand.key);

  return (
    <div className="relative">
      <nav
        aria-label="Prototype tools"
        className="fixed bottom-3 right-3 z-50 flex max-w-[calc(100vw-24px)] flex-wrap justify-end gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur sm:bottom-4 sm:right-4"
      >
        <a
          href={`/prototype/cashflow?tenant=${tenant}`}
          className="rounded-xl bg-indigo-50 px-3 py-2 text-[11px] font-black text-indigo-700 no-underline sm:text-xs"
        >
          Safe-to-Spend
        </a>
        <a
          href={`/prototype/bill-guard?tenant=${tenant}`}
          className="rounded-xl bg-violet-50 px-3 py-2 text-[11px] font-black text-violet-700 no-underline sm:text-xs"
        >
          Bill Guard
        </a>
        <a
          href={`/prototype/transparency?tenant=${tenant}`}
          className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700 no-underline sm:text-xs"
        >
          Fees & limits
        </a>
        <a
          href={`/prototype/trust?tenant=${tenant}`}
          className="rounded-xl bg-cyan-50 px-3 py-2 text-[11px] font-black text-cyan-800 no-underline sm:text-xs"
        >
          Trust & security
        </a>
        <a
          href={`/prototype/operations?tenant=${tenant}`}
          className="rounded-xl bg-[#0b153d] px-3 py-2 text-[11px] font-black text-white no-underline sm:text-xs"
        >
          Operations
        </a>
      </nav>
      <PrototypeDashboard initialBrand={publicBrandConfig(brand)} />
    </div>
  );
}
