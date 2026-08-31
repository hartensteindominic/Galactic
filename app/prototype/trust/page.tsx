import { headers } from 'next/headers';
import { prototypeTrustCenter, type TrustControlStatus } from '../../../lib/prototype-trust';
import { resolveRequestBrand } from '../../../lib/tenant-boundary';
import { publicBrandConfig } from '../../../lib/white-label';

const STATUS_LABEL: Record<TrustControlStatus, string> = {
  'implemented-prototype': 'Prototype control',
  'not-production-ready': 'Not production ready',
  'external-approval-required': 'External approval required'
};

export default async function PrototypeTrustPage({
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
  const trust = prototypeTrustCenter();
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
          <div className="flex flex-wrap gap-2">
            <a
              href={`/prototype/transparency?tenant=${tenant}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold no-underline shadow-sm"
            >
              Fees & limits
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
            <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-bold text-cyan-100">Trust through evidence, not promises</span>
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Trust & Security Center</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
            See what this prototype actually protects, what each control does not prove, and what must still be approved or exercised before real financial services could launch.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {trust.controls.map((control) => (
            <article key={control.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Control</p>
                  <h2 className="mt-1 text-xl font-black">{control.name}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
                  {STATUS_LABEL[control.status]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{control.summary}</p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">What this does not prove</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{control.limitation}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">Still required before live banking</p>
          <h2 className="mt-1 text-2xl font-black text-amber-950">Known production gaps stay visible.</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {trust.productionGaps.map((gap) => (
              <div key={gap} className="rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-amber-950">
                <span aria-hidden="true" className="mr-2 font-black">○</span>{gap}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Live money</p>
            <p className="mt-2 text-2xl font-black">OFF</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">No real deposits or customer money movement through prototype routes.</p>
          </article>
          <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Production DLP</p>
            <p className="mt-2 text-2xl font-black">NOT READY</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">The chat detector is a best-effort prototype guard, not enterprise data-loss prevention.</p>
          </article>
          <article className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">Live terms / program approval</p>
            <p className="mt-2 text-2xl font-black">NOT APPROVED</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">No code path can self-approve legal, sponsor-bank, insurance, fee, or rate claims.</p>
          </article>
        </section>

        <footer className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
          <b className="text-slate-900">Prototype trust disclosure:</b> {trust.disclosure}
        </footer>
      </div>
    </main>
  );
}
