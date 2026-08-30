import { bankingJson } from '../../../../lib/banking-http';
import { prototypeReadiness } from '../../../../lib/prototype-readiness';
import { publicBrandConfig, resolveBrand } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const brand = resolveBrand({
    host: request.headers.get('host'),
    key: url.searchParams.get('tenant')
  });

  return bankingJson({
    ok: true,
    brand: publicBrandConfig(brand),
    readiness: prototypeReadiness()
  });
}
