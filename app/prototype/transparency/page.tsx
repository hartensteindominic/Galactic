import { headers } from 'next/headers';
import { prototypeTransparency } from '../../../lib/prototype-transparency';
import { resolveRequestBrand } from '../../../lib/tenant-boundary';
import { publicBrandConfig } from '../../../lib/white-label';

const STATUS_LABELS = {
  prototype: 'Prototype',
  sandbox: 'Sandbox',
  'partner-required': 'Partner required',
  unavailable: 'Unavailable'
} as const;

export default async function PrototypeTransparencyPage({
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
  const publicBrand = publicBrandConfig(brand);
  const transparency = prototypeTransparency();
  const tenant = encodeURIComponent(brand.key);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#0b153d]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`/prototype?tenant=${tenant}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold no-underline shadow-sm"
          >
            ← Back to {publicBrand.name}
          </a>
          <div className="flex gap-2">
            <a
              href={`/prototype/cashflow?tenant=${tenant}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold no-underline shadow-sm"
            >
              Cash-flow intelligence
            </a>
            <a
              href={`/prototype/operations?tenant=${tenant}`}
              className="rounded-full bg-[#0b153d] px-4 py-2 text-sm font-bold text-white no-underline shadow-sm"
            >
              Operations
            </a>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] bg-[#0b153d] px-6 py-8 text-white shadow-xl sm:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black tracking-[0.14em]">SIMULATION ONLY</span>
            <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-100">No hidden live-bank claims</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-100">Terms source: {transparency.customerTermsVersion}</span>
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Know the fee, limit, eligibility, and real status before you tap.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
            This is the transparency standard we want for every future product surface: no buried terms, no mystery limits, and no pretending a partner-dependent feature is already live.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {transparency.items.map((item) => (
            <article key={item.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{item.category.replace('-', ' ')}</p>
                  <h2 className="mt-1 text-xl font-black">{item.name}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                  {STATUS_LABELS[item.availability]}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Cost</p>
                  <p className="mt-1 text-sm font-bold">{item.costLabel}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Limits</p>
                  <p className="mt-1 text-sm font-bold">{item.limitsLabel}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Eligibility</p>
                  <p className="mt-1 text-sm font-bold">{item.eligibilityLabel}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{item.plainEnglish}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Terms control</p>
            <h2 className="mt-1 text-xl font-black">Versioned prototype wording</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3">
                <dt className="font-bold text-slate-500">Source version</dt>
                <dd className="font-black">{transparency.customerTermsVersion}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3">
                <dt className="font-bold text-slate-500">Source status</dt>
                <dd className="font-black">{transparency.customerTermsStatus}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3">
                <dt className="font-bold text-slate-500">Approved for live use</dt>
                <dd className="font-black">{transparency.liveCustomerTermsApproved ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p className="font-black">Why this matters</p>
            <p className="mt-1">
              {transparency.disclosure} A future live product must use a separately approved, versioned source before any fee, rate, limit, insurance statement, eligibility rule, partner disclosure, timing promise, or other changing customer term appears as a customer promise.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}