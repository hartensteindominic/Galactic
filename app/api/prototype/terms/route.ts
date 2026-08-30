import { NextResponse } from 'next/server';
import { customerTermsControlStatus, getPrototypeCustomerTerms } from '../../../../lib/customer-terms-control';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const brand = resolveRequestBrand({
    host: request.headers.get('host'),
    requestedKey: url.searchParams.get('tenant') || undefined
  });
  const terms = getPrototypeCustomerTerms(brand.key);

  return NextResponse.json({
    ok: true,
    tenantKey: brand.key,
    source: {
      version: terms.version,
      status: terms.status,
      effectiveAt: terms.effectiveAt,
      liveTermsApproved: terms.liveTermsApproved
    },
    controls: customerTermsControlStatus(),
    terms: {
      accountFeeLabel: terms.accountFeeLabel,
      sandboxLinkFeeLabel: terms.sandboxLinkFeeLabel,
      feeRateDisclosure: terms.feeRateDisclosure,
      depositInsuranceDisclosure: terms.depositInsuranceDisclosure,
      transferDisclosure: terms.transferDisclosure,
      fundingDisclosure: terms.fundingDisclosure,
      rewardsDisclosure: terms.rewardsDisclosure,
      cashflowDisclosure: terms.cashflowDisclosure,
      changingTermsDisclosure: terms.changingTermsDisclosure
    },
    disclosure: 'Prototype-only terms source. This endpoint does not expose or imply approved live banking terms.'
  }, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}