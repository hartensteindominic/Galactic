import { BankingError } from './banking';
import { getPrototypeSnapshot } from './prototype-ledger';

export type CashflowItem = {
  id: string;
  kind: 'income' | 'bill' | 'planned_savings';
  name: string;
  amountCents: number;
  scheduledFor: string;
  confidence: 'scheduled' | 'estimated';
  recurring: boolean;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetCents: number;
  savedCents: number;
  targetDate: string | null;
};

export type ForecastHorizon = {
  days: 7 | 14 | 30;
  expectedIncomeCents: number;
  expectedBillsCents: number;
  plannedSavingsCents: number;
  projectedBalanceCents: number;
  spendableAfterReserveCents: number;
  status: 'comfortable' | 'tight' | 'shortfall';
};

export type CashflowForecast = {
  source: 'memory' | 'supabase';
  tenantKey: string;
  userId: string;
  asOf: string;
  currentBalanceCents: number;
  reserveCents: number;
  conservativeSpendableEstimateCents: number;
  horizons: ForecastHorizon[];
  upcoming: CashflowItem[];
  savingsGoals: SavingsGoal[];
  assumptions: string[];
  disclosure: string;
};

type TenantRow = { id: string };
type ProfileRow = { id: string };
type CashflowRow = {
  id: string;
  kind: CashflowItem['kind'];
  name: string;
  amount_cents: number;
  scheduled_for: string;
  confidence: CashflowItem['confidence'];
  recurring: boolean;
  simulated: boolean;
};
type GoalRow = {
  id: string;
  name: string;
  target_cents: number;
  saved_cents: number;
  target_date: string | null;
  simulated: boolean;
};

function supabaseConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '') || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { baseUrl, secretKey, configured: Boolean(baseUrl && secretKey) };
}

async function supabaseRequest<T>(path: string): Promise<T> {
  const config = supabaseConfig();
  if (!config.configured) throw new BankingError(503, 'SUPABASE_NOT_CONFIGURED', 'The prototype database is not configured.');

  const response = await fetch(`${config.baseUrl}${path}`, {
    headers: {
      apikey: config.secretKey,
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new BankingError(502, 'CASHFLOW_DATABASE_ERROR', 'Cash-flow planning data is temporarily unavailable.');
  }

  return response.json() as Promise<T>;
}

function isoDateFromNow(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function memoryItems(): CashflowItem[] {
  const rows: Array<[CashflowItem['kind'], string, number, number, CashflowItem['confidence'], boolean]> = [
    ['bill', 'Rent', 140000, 4, 'scheduled', true],
    ['income', 'Payroll', 285000, 7, 'scheduled', true],
    ['bill', 'Phone', 7800, 9, 'scheduled', true],
    ['bill', 'Music subscription', 1199, 12, 'scheduled', true],
    ['planned_savings', 'Emergency fund', 50000, 14, 'estimated', true],
    ['bill', 'Utilities', 12400, 18, 'estimated', true],
    ['income', 'Payroll', 285000, 21, 'scheduled', true],
    ['bill', 'Internet', 6900, 24, 'scheduled', true],
    ['planned_savings', 'Emergency fund', 50000, 28, 'estimated', true]
  ];

  return rows.map((row, index) => ({
    id: `memory-cashflow-${index + 1}`,
    kind: row[0],
    name: row[1],
    amountCents: row[2],
    scheduledFor: isoDateFromNow(row[3]),
    confidence: row[4],
    recurring: row[5]
  }));
}

function statusFor(projectedBalanceCents: number, reserveCents: number): ForecastHorizon['status'] {
  if (projectedBalanceCents < 0) return 'shortfall';
  if (projectedBalanceCents < reserveCents) return 'tight';
  return 'comfortable';
}

function buildForecast(input: {
  source: CashflowForecast['source'];
  tenantKey: string;
  userId: string;
  currentBalanceCents: number;
  reserveCents: number;
  items: CashflowItem[];
  savingsGoals: SavingsGoal[];
}): CashflowForecast {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const horizons = ([7, 14, 30] as const).map<ForecastHorizon>((days) => {
    const cutoff = new Date(today);
    cutoff.setUTCDate(cutoff.getUTCDate() + days);

    const included = input.items.filter((item) => {
      const scheduled = new Date(`${item.scheduledFor}T00:00:00Z`);
      return scheduled >= today && scheduled <= cutoff;
    });

    const expectedIncomeCents = included.filter((item) => item.kind === 'income').reduce((sum, item) => sum + item.amountCents, 0);
    const expectedBillsCents = included.filter((item) => item.kind === 'bill').reduce((sum, item) => sum + item.amountCents, 0);
    const plannedSavingsCents = included.filter((item) => item.kind === 'planned_savings').reduce((sum, item) => sum + item.amountCents, 0);
    const projectedBalanceCents = input.currentBalanceCents + expectedIncomeCents - expectedBillsCents - plannedSavingsCents;

    return {
      days,
      expectedIncomeCents,
      expectedBillsCents,
      plannedSavingsCents,
      projectedBalanceCents,
      spendableAfterReserveCents: Math.max(0, projectedBalanceCents - input.reserveCents),
      status: statusFor(projectedBalanceCents, input.reserveCents)
    };
  });

  const conservativeSpendableEstimateCents = Math.max(
    0,
    Math.min(input.currentBalanceCents - input.reserveCents, ...horizons.map((horizon) => horizon.spendableAfterReserveCents))
  );

  return {
    source: input.source,
    tenantKey: input.tenantKey,
    userId: input.userId,
    asOf: new Date().toISOString(),
    currentBalanceCents: input.currentBalanceCents,
    reserveCents: input.reserveCents,
    conservativeSpendableEstimateCents,
    horizons,
    upcoming: input.items.slice().sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
    savingsGoals: input.savingsGoals,
    assumptions: [
      'Only scheduled or estimated prototype items shown here are included.',
      'Pending card transactions, variable bills, cash withdrawals, fees, and unrecognized obligations may change the result.',
      'The reserve is intentionally kept untouched in the spendable estimate.',
      'This is a planning estimate, not a guarantee that spending the displayed amount is safe.'
    ],
    disclosure: 'Simulation-only cash-flow planning. This estimate is educational product UX, not financial advice, an overdraft guarantee, credit decision, or authorization to spend.'
  };
}

export async function getPrototypeCashflowForecast(input: {
  tenantKey: string;
  userId?: string;
  reserveCents?: number;
}): Promise<CashflowForecast> {
  const userId = input.userId || 'demo-nova';
  const reserveCents = Number.isInteger(input.reserveCents) && (input.reserveCents as number) >= 0 && (input.reserveCents as number) <= 1000000
    ? input.reserveCents as number
    : 50000;

  const snapshot = await getPrototypeSnapshot(input.tenantKey, userId);
  if (!supabaseConfig().configured || snapshot.source !== 'supabase') {
    return buildForecast({
      source: 'memory',
      tenantKey: input.tenantKey,
      userId,
      currentBalanceCents: snapshot.totalBalanceCents,
      reserveCents,
      items: memoryItems(),
      savingsGoals: [{
        id: 'memory-goal-1',
        name: 'Emergency fund',
        targetCents: 300000,
        savedCents: 125000,
        targetDate: isoDateFromNow(120)
      }]
    });
  }

  const tenants = await supabaseRequest<TenantRow[]>(`/rest/v1/fintech_tenants?select=id&tenant_key=eq.${encodeURIComponent(input.tenantKey)}&limit=1`);
  const tenant = tenants[0];
  if (!tenant) throw new BankingError(404, 'UNKNOWN_TENANT', 'Unknown prototype tenant.');

  const profiles = await supabaseRequest<ProfileRow[]>(`/rest/v1/fintech_profiles?select=id&tenant_id=eq.${tenant.id}&external_user_id=eq.${encodeURIComponent(userId)}&limit=1`);
  const profile = profiles[0];
  if (!profile) throw new BankingError(404, 'UNKNOWN_USER', 'Unknown prototype user.');

  const [itemRows, goalRows] = await Promise.all([
    supabaseRequest<CashflowRow[]>(`/rest/v1/fintech_cashflow_items?select=id,kind,name,amount_cents,scheduled_for,confidence,recurring,simulated&tenant_id=eq.${tenant.id}&profile_id=eq.${profile.id}&scheduled_for=gte.${isoDateFromNow(0)}&scheduled_for=lte.${isoDateFromNow(30)}&order=scheduled_for.asc`),
    supabaseRequest<GoalRow[]>(`/rest/v1/fintech_savings_goals?select=id,name,target_cents,saved_cents,target_date,simulated&tenant_id=eq.${tenant.id}&profile_id=eq.${profile.id}&order=created_at.asc`)
  ]);

  const items = itemRows.filter((row) => row.simulated).map<CashflowItem>((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    amountCents: Number(row.amount_cents),
    scheduledFor: row.scheduled_for,
    confidence: row.confidence,
    recurring: row.recurring
  }));

  const savingsGoals = goalRows.filter((row) => row.simulated).map<SavingsGoal>((row) => ({
    id: row.id,
    name: row.name,
    targetCents: Number(row.target_cents),
    savedCents: Number(row.saved_cents),
    targetDate: row.target_date
  }));

  return buildForecast({
    source: 'supabase',
    tenantKey: input.tenantKey,
    userId,
    currentBalanceCents: snapshot.totalBalanceCents,
    reserveCents,
    items,
    savingsGoals
  });
}
