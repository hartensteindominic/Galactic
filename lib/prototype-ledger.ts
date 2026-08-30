import { BankingError } from './banking';

export type PrototypeAccount = {
  id: string;
  label: string;
  accountType: 'checking' | 'savings' | 'wallet';
  routingNumber: string;
  accountLast4: string;
  balanceCents: number;
  currency: 'USD';
  simulated: true;
};

export type PrototypeTransaction = {
  id: string;
  accountId: string;
  direction: 'debit' | 'credit';
  amountCents: number;
  name: string;
  category: string;
  status: 'pending' | 'posted' | 'failed';
  provider: string;
  occurredAt: string;
};

export type PrototypeSnapshot = {
  source: 'memory' | 'supabase';
  tenantKey: string;
  userId: string;
  displayName: string;
  totalBalanceCents: number;
  accounts: PrototypeAccount[];
  transactions: PrototypeTransaction[];
  disclosure: string;
};

type SupabaseTenant = { id: string; tenant_key: string; name: string };
type SupabaseProfile = { id: string; external_user_id: string; display_name: string };
type SupabaseAccount = {
  id: string;
  label: string;
  account_type: PrototypeAccount['accountType'];
  routing_number: string;
  account_last4: string;
  balance_cents: number;
  currency: 'USD';
  simulated: boolean;
};
type SupabaseTransaction = {
  id: string;
  account_id: string;
  direction: PrototypeTransaction['direction'];
  amount_cents: number;
  name: string;
  category: string;
  status: PrototypeTransaction['status'];
  provider: string;
  occurred_at: string;
};

const DEMO_ACCOUNT_ID = '11111111-1111-4111-8111-111111111111';

function supabaseConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '') || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { baseUrl, secretKey, configured: Boolean(baseUrl && secretKey) };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config.configured) {
    throw new BankingError(503, 'SUPABASE_NOT_CONFIGURED', 'The prototype database has not been configured.');
  }

  const headers = new Headers(init?.headers);
  headers.set('apikey', config.secretKey);
  headers.set('Authorization', `Bearer ${config.secretKey}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Prototype Supabase request failed', response.status, detail.slice(0, 300));
    throw new BankingError(502, 'PROTOTYPE_DATABASE_ERROR', 'The prototype ledger is temporarily unavailable.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function demoSnapshot(tenantKey: string, userId: string): PrototypeSnapshot {
  const now = Date.now();
  const accounts: PrototypeAccount[] = [
    {
      id: DEMO_ACCOUNT_ID,
      label: 'Demo Checking',
      accountType: 'checking',
      routingNumber: '000000000',
      accountLast4: '4532',
      balanceCents: 1523045,
      currency: 'USD',
      simulated: true
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      label: 'Demo Savings',
      accountType: 'savings',
      routingNumber: '000000000',
      accountLast4: '8756',
      balanceCents: 912027,
      currency: 'USD',
      simulated: true
    }
  ];

  const transactions: PrototypeTransaction[] = [
    {
      id: 'memory-tx-1',
      accountId: DEMO_ACCOUNT_ID,
      direction: 'debit',
      amountCents: 8932,
      name: 'Demo Marketplace',
      category: 'Shopping',
      status: 'posted',
      provider: 'memory',
      occurredAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'memory-tx-2',
      accountId: DEMO_ACCOUNT_ID,
      direction: 'credit',
      amountCents: 285000,
      name: 'Payroll Direct Deposit',
      category: 'Income',
      status: 'posted',
      provider: 'memory',
      occurredAt: new Date(now - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'memory-tx-3',
      accountId: DEMO_ACCOUNT_ID,
      direction: 'debit',
      amountCents: 1199,
      name: 'Music Subscription',
      category: 'Entertainment',
      status: 'posted',
      provider: 'memory',
      occurredAt: new Date(now - 72 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    source: 'memory',
    tenantKey,
    userId,
    displayName: 'Nova Star',
    totalBalanceCents: accounts.reduce((sum, account) => sum + account.balanceCents, 0),
    accounts,
    transactions,
    disclosure: 'Simulation only. These balances, routing numbers, accounts, and transactions are synthetic and cannot move real money.'
  };
}

export function prototypeLedgerStatus() {
  const config = supabaseConfig();
  return {
    configured: config.configured,
    source: config.configured ? 'supabase' : 'memory',
    liveMoneyEnabled: false,
    persistentTransferIdempotency: config.configured,
    disclosure: config.configured
      ? 'Supabase prototype ledger configured. Data remains simulated; live banking rails are disabled.'
      : 'In-memory demo ledger active. Add server-side Supabase environment variables to persist simulated data.'
  } as const;
}

export async function getPrototypeSnapshot(tenantKey: string, userId = 'demo-nova'): Promise<PrototypeSnapshot> {
  if (!supabaseConfig().configured) return demoSnapshot(tenantKey, userId);

  const tenantFilter = encodeURIComponent(tenantKey);
  const tenants = await supabaseRequest<SupabaseTenant[]>(
    `/rest/v1/fintech_tenants?select=id,tenant_key,name&tenant_key=eq.${tenantFilter}&limit=1`
  );
  const tenant = tenants[0];
  if (!tenant) return demoSnapshot(tenantKey, userId);

  const profiles = await supabaseRequest<SupabaseProfile[]>(
    `/rest/v1/fintech_profiles?select=id,external_user_id,display_name&tenant_id=eq.${tenant.id}&external_user_id=eq.${encodeURIComponent(userId)}&limit=1`
  );
  const profile = profiles[0];
  if (!profile) return demoSnapshot(tenantKey, userId);

  const [accountRows, transactionRows] = await Promise.all([
    supabaseRequest<SupabaseAccount[]>(
      `/rest/v1/fintech_accounts?select=id,label,account_type,routing_number,account_last4,balance_cents,currency,simulated&tenant_id=eq.${tenant.id}&profile_id=eq.${profile.id}&order=created_at.asc`
    ),
    supabaseRequest<SupabaseTransaction[]>(
      `/rest/v1/fintech_transactions?select=id,account_id,direction,amount_cents,name,category,status,provider,occurred_at&tenant_id=eq.${tenant.id}&profile_id=eq.${profile.id}&order=occurred_at.desc&limit=20`
    )
  ]);

  const accounts = accountRows.filter((row) => row.simulated).map<PrototypeAccount>((row) => ({
    id: row.id,
    label: row.label,
    accountType: row.account_type,
    routingNumber: row.routing_number,
    accountLast4: row.account_last4,
    balanceCents: Number(row.balance_cents),
    currency: row.currency,
    simulated: true
  }));

  const transactions = transactionRows.map<PrototypeTransaction>((row) => ({
    id: row.id,
    accountId: row.account_id,
    direction: row.direction,
    amountCents: Number(row.amount_cents),
    name: row.name,
    category: row.category,
    status: row.status,
    provider: row.provider,
    occurredAt: row.occurred_at
  }));

  return {
    source: 'supabase',
    tenantKey: tenant.tenant_key,
    userId: profile.external_user_id,
    displayName: profile.display_name,
    totalBalanceCents: accounts.reduce((sum, account) => sum + account.balanceCents, 0),
    accounts,
    transactions,
    disclosure: 'Simulation only. Supabase persists synthetic balances and transactions; no real deposits are held and no real money is moved.'
  };
}

export async function createPrototypeTransfer(input: {
  tenantKey: string;
  userId?: string;
  fromAccountId: string;
  recipient: string;
  amountCents: number;
  memo?: string;
  idempotencyKey: string;
}) {
  const userId = input.userId || 'demo-nova';
  if (!input.fromAccountId.trim()) throw new BankingError(400, 'SOURCE_ACCOUNT_REQUIRED', 'Choose a source account.');
  if (!input.recipient.trim()) throw new BankingError(400, 'RECIPIENT_REQUIRED', 'Enter a mock recipient.');
  if (!Number.isInteger(input.amountCents) || input.amountCents < 1 || input.amountCents > 1000000) {
    throw new BankingError(400, 'INVALID_AMOUNT', 'Prototype transfers must be between $0.01 and $10,000.00.');
  }
  const idempotencyKey = input.idempotencyKey.trim();
  if (idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    throw new BankingError(400, 'IDEMPOTENCY_REQUIRED', 'A valid idempotency key is required for simulated transfers.');
  }

  if (!supabaseConfig().configured) {
    return {
      id: `memory-transfer-${Date.now()}`,
      status: 'simulated',
      amount_cents: input.amountCents,
      recipient: input.recipient.trim(),
      idempotent_replay: false,
      message: 'Simulated transfer accepted in memory. Configure Supabase for persistent idempotency and ledger changes.'
    };
  }

  return supabaseRequest<{
    id: string;
    status: 'simulated';
    amount_cents: number;
    recipient: string;
    idempotent_replay: boolean;
    message: string;
  }>('/rest/v1/rpc/simulate_fintech_transfer', {
    method: 'POST',
    body: JSON.stringify({
      p_tenant_key: input.tenantKey,
      p_user_external_id: userId,
      p_from_account_id: input.fromAccountId,
      p_recipient: input.recipient.trim(),
      p_amount_cents: input.amountCents,
      p_memo: input.memo?.trim() || null,
      p_idempotency_key: idempotencyKey
    })
  });
}

export async function recordSandboxLinkedAccounts(input: {
  tenantKey: string;
  userId?: string;
  institutionName: string;
  accounts: Array<{ providerAccountId: string; last4?: string | null; subtype?: string | null }>;
}) {
  if (!supabaseConfig().configured || input.accounts.length === 0) return { persisted: false };
  const userId = input.userId || 'demo-nova';

  const tenants = await supabaseRequest<SupabaseTenant[]>(
    `/rest/v1/fintech_tenants?select=id&tenant_key=eq.${encodeURIComponent(input.tenantKey)}&limit=1`
  );
  const tenant = tenants[0];
  if (!tenant) return { persisted: false };

  const profiles = await supabaseRequest<SupabaseProfile[]>(
    `/rest/v1/fintech_profiles?select=id&tenant_id=eq.${tenant.id}&external_user_id=eq.${encodeURIComponent(userId)}&limit=1`
  );
  const profile = profiles[0];
  if (!profile) return { persisted: false };

  await supabaseRequest<unknown>('/rest/v1/fintech_linked_accounts?on_conflict=tenant_id,profile_id,provider,provider_account_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(input.accounts.map((account) => ({
      tenant_id: tenant.id,
      profile_id: profile.id,
      provider: 'plaid_sandbox',
      institution_name: input.institutionName,
      provider_account_id: account.providerAccountId,
      account_last4: account.last4 || null,
      routing_last4: null,
      subtype: account.subtype || null,
      simulated: true
    })))
  });

  return { persisted: true };
}
