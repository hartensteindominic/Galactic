import type { CashflowForecast, CashflowItem } from './prototype-cashflow';

export type BillGuardStatus = 'covered' | 'tight' | 'shortfall';

export type BillGuardHorizon = {
  days: 7 | 14 | 30;
  knownBillsCents: number;
  scheduledBillsCents: number;
  estimatedBillsCents: number;
  availableForBillsCents: number;
  uncoveredBillsCents: number;
  coveragePercent: number;
  cashAfterBillsSavingsAndReserveCents: number;
  status: BillGuardStatus;
};

export type BillGuardPlan = {
  planningOnly: true;
  automaticBillPayEnabled: false;
  fundsReservedOrMoved: false;
  liveBillProviderConnected: false;
  tenantKey: string;
  asOf: string;
  nextBill: CashflowItem | null;
  knownBillsNext30DaysCents: number;
  scheduledBillsNext30DaysCents: number;
  estimatedBillsNext30DaysCents: number;
  estimatedBillCount: number;
  lowestCoveragePercent: number;
  allKnownBillsCoveredAcrossHorizons: boolean;
  horizons: BillGuardHorizon[];
  assumptions: string[];
  disclosure: string;
};

function beginningOfUtcDay(value: string) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function billsWithinDays(forecast: CashflowForecast, days: 7 | 14 | 30) {
  const start = beginningOfUtcDay(forecast.asOf);
  const cutoff = new Date(start);
  cutoff.setUTCDate(cutoff.getUTCDate() + days);

  return forecast.upcoming.filter((item) => {
    if (item.kind !== 'bill') return false;
    const scheduled = new Date(`${item.scheduledFor}T00:00:00Z`);
    return scheduled >= start && scheduled <= cutoff;
  });
}

function statusFromForecast(status: CashflowForecast['horizons'][number]['status']): BillGuardStatus {
  if (status === 'comfortable') return 'covered';
  return status;
}

export function buildPrototypeBillGuard(forecast: CashflowForecast): BillGuardPlan {
  const horizons = forecast.horizons.map<BillGuardHorizon>((horizon) => {
    const bills = billsWithinDays(forecast, horizon.days);
    const scheduledBillsCents = bills
      .filter((item) => item.confidence === 'scheduled')
      .reduce((sum, item) => sum + item.amountCents, 0);
    const estimatedBillsCents = bills
      .filter((item) => item.confidence === 'estimated')
      .reduce((sum, item) => sum + item.amountCents, 0);
    const knownBillsCents = scheduledBillsCents + estimatedBillsCents;
    const availableForBillsCents = Math.max(
      0,
      forecast.currentBalanceCents + horizon.expectedIncomeCents - forecast.reserveCents - horizon.plannedSavingsCents
    );
    const uncoveredBillsCents = Math.max(0, knownBillsCents - availableForBillsCents);
    const coveragePercent = knownBillsCents === 0
      ? 100
      : Math.min(100, Math.max(0, Math.floor((availableForBillsCents / knownBillsCents) * 100)));

    return {
      days: horizon.days,
      knownBillsCents,
      scheduledBillsCents,
      estimatedBillsCents,
      availableForBillsCents,
      uncoveredBillsCents,
      coveragePercent,
      cashAfterBillsSavingsAndReserveCents:
        forecast.currentBalanceCents +
        horizon.expectedIncomeCents -
        knownBillsCents -
        horizon.plannedSavingsCents -
        forecast.reserveCents,
      status: statusFromForecast(horizon.status)
    };
  });

  const bills30 = billsWithinDays(forecast, 30);
  const scheduledBillsNext30DaysCents = bills30
    .filter((item) => item.confidence === 'scheduled')
    .reduce((sum, item) => sum + item.amountCents, 0);
  const estimatedBillsNext30DaysCents = bills30
    .filter((item) => item.confidence === 'estimated')
    .reduce((sum, item) => sum + item.amountCents, 0);
  const nextBill = forecast.upcoming.find((item) => item.kind === 'bill') || null;

  return {
    planningOnly: true,
    automaticBillPayEnabled: false,
    fundsReservedOrMoved: false,
    liveBillProviderConnected: false,
    tenantKey: forecast.tenantKey,
    asOf: forecast.asOf,
    nextBill,
    knownBillsNext30DaysCents: scheduledBillsNext30DaysCents + estimatedBillsNext30DaysCents,
    scheduledBillsNext30DaysCents,
    estimatedBillsNext30DaysCents,
    estimatedBillCount: bills30.filter((item) => item.confidence === 'estimated').length,
    lowestCoveragePercent: Math.min(...horizons.map((horizon) => horizon.coveragePercent)),
    allKnownBillsCoveredAcrossHorizons: horizons.every((horizon) => horizon.uncoveredBillsCents === 0),
    horizons,
    assumptions: [
      'Bill Guard only uses scheduled or estimated prototype bills currently present in the cash-flow forecast.',
      'Estimated bills can change, and unknown obligations are not included.',
      'Projected income may arrive later than expected or may not arrive at all.',
      'The reserve and planned savings remain assumptions in this planning view; no funds are actually separated or moved.'
    ],
    disclosure: 'Bill Guard is simulation-only planning. It does not reserve money, pay bills, enable autopay, guarantee bill coverage, prevent overdrafts, or authorize spending.'
  };
}

export function billGuardControlStatus() {
  return {
    planningLayerImplemented: true,
    usesCashflowForecastSource: true,
    automaticBillPayEnabled: false,
    fundsReservedOrMoved: false,
    liveBillProviderConnected: false,
    productionBillPaymentControlsVerified: false
  } as const;
}
