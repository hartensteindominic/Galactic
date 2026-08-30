import { headers } from 'next/headers';
import { charterReadinessStatus } from '../../../lib/charter-readiness';
import { complianceObligationRegisterStatus } from '../../../lib/compliance-obligation-register';
import { institutionAccountabilityStatus } from '../../../lib/institution-accountability';
import { resolveRequestBrand } from '../../../lib/tenant-boundary';
import { threeYearBankPlanStatus } from '../../../lib/three-year-bank-plan';
import { unitEconomicsControlStatus } from '../../../lib/unit-economics';
import { StrategyShell } from './strategy-shell';

export default async function PrototypeStrategyPage({
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

  return (
    <StrategyShell
      tenantKey={brand.key}
      brandName={brand.name}
      charter={charterReadinessStatus()}
      economicsControls={unitEconomicsControlStatus()}
      compliance={complianceObligationRegisterStatus()}
      accountability={institutionAccountabilityStatus()}
      threeYearBankPlan={threeYearBankPlanStatus()}
    />
  );
}
