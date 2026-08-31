import { BankingError } from './banking';
import { recordSandboxLinkedAccounts } from './prototype-ledger';

type PlaidAccount = {
  account_id: string;
  name: string;
  mask: string | null;
  subtype: string | null;
  type: string;
  balances?: { current?: number | null; available?: number | null; iso_currency_code?: string | null };
};

type PlaidTransaction = {
  transaction_id: string;
  account_id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category?: string[] | null;
};

function config() {
  return {
    clientId: process.env.PLAID_CLIENT_ID || '',
    secret: process.env.PLAID_SECRET || '',
    environment: process.env.PLAID_ENV === 'sandbox' ? 'sandbox' : 'disabled',
    institutionId: process.env.PLAID_SANDBOX_INSTITUTION_ID || 'ins_109508'
  } as const;
}

export function plaidSandboxStatus() {
  const current = config();
  const credentialsConfigured = Boolean(current.clientId && current.secret && current.environment === 'sandbox');
  return {
    configured: credentialsConfigured,
    credentialsConfigured,
    environment: current.environment,
    sandboxConnectionExerciseVerified: false,
    sandboxPersistenceExerciseVerified: false,
    productionProviderApproved: false,
    productionWebhookVerificationEnabled: false,
    liveBankLinkingEnabled: false,
    disclosure: credentialsConfigured
      ? 'Plaid Sandbox credentials are configured. That does not prove the sandbox connection, persistence path, provider semantics, or production integration has been exercised or approved. Linked institutions and transactions remain test data only.'
      : 'Plaid Sandbox credentials are not configured. The prototype uses a local synthetic mock-bank fallback.'
  } as const;
}

async function plaidPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const current = config();
  if (!current.clientId || !current.secret || current.environment !== 'sandbox') {
    throw new BankingError(503, 'PLAID_SANDBOX_NOT_CONFIGURED', 'Plaid Sandbox is not configured.');
  }

  const response = await fetch(`https://sandbox.plaid.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PLAID-CLIENT-ID': current.clientId,
      'PLAID-SECRET': current.secret
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  if (!response.ok) {
    console.error('Plaid Sandbox request failed', {
      path,
      status: response.status,
      responseBodyLogged: false
    });
    throw new BankingError(
      502,
      'PLAID_SANDBOX_ERROR',
      'Plaid Sandbox could not complete the synthetic account-link request.'
    );
  }

  return response.json() as Promise<T>;
}

function localFallback() {
  return {
    mode: 'local_mock' as const,
    institutionName: 'First Sandbox Bank',
    accounts: [
      { id: 'mock-plaid-checking', name: 'Sandbox Checking', last4: '0000', subtype: 'checking', currentBalance: 2500.5 },
      { id: 'mock-plaid-savings', name: 'Sandbox Savings', last4: '1111', subtype: 'savings', currentBalance: 7800 }
    ],
    transactions: [
      { id: 'mock-plaid-tx-1', accountId: 'mock-plaid-checking', name: 'Sandbox Grocery', amountCents: -6245, date: '2026-08-29', pending: false, category: 'Food and Drink' },
      { id: 'mock-plaid-tx-2', accountId: 'mock-plaid-checking', name: 'Sandbox Payroll', amountCents: 185000, date: '2026-08-28', pending: false, category: 'Income' },
      { id: 'mock-plaid-tx-3', accountId: 'mock-plaid-checking', name: 'Sandbox Transit', amountCents: -275, date: '2026-08-27', pending: false, category: 'Travel' }
    ],
    persisted: false,
    disclosure: 'Local synthetic fallback. Configure Plaid Sandbox server credentials to exercise the sandbox API; configuration alone does not verify that exercise.'
  };
}

export async function connectOneClickSandboxBank(input: { tenantKey: string; userId?: string }) {
  const status = plaidSandboxStatus();
  if (!status.credentialsConfigured) return localFallback();

  const current = config();
  const publicTokenResponse = await plaidPost<{ public_token: string }>('/sandbox/public_token/create', {
    institution_id: current.institutionId,
    initial_products: ['transactions']
  });

  const exchange = await plaidPost<{ access_token: string; item_id: string }>('/item/public_token/exchange', {
    public_token: publicTokenResponse.public_token
  });

  const today = new Date();
  const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const iso = (date: Date) => date.toISOString().slice(0, 10);

  const [accountsResponse, transactionsResponse] = await Promise.all([
    plaidPost<{ accounts: PlaidAccount[]; item: { institution_id?: string | null } }>('/accounts/get', {
      access_token: exchange.access_token
    }),
    plaidPost<{ transactions: PlaidTransaction[] }>('/transactions/get', {
      access_token: exchange.access_token,
      start_date: iso(start),
      end_date: iso(today),
      options: { count: 25, offset: 0 }
    })
  ]);

  const accounts = (accountsResponse.accounts || []).map((account) => ({
    id: account.account_id,
    name: account.name,
    last4: account.mask,
    subtype: account.subtype,
    currentBalance: account.balances?.current ?? null
  }));

  const transactions = (transactionsResponse.transactions || []).slice(0, 12).map((transaction) => ({
    id: transaction.transaction_id,
    accountId: transaction.account_id,
    name: transaction.name,
    amountCents: Math.round(transaction.amount * -100),
    date: transaction.date,
    pending: transaction.pending,
    category: transaction.category?.[0] || 'Other'
  }));

  const persistence = await recordSandboxLinkedAccounts({
    tenantKey: input.tenantKey,
    userId: input.userId,
    institutionName: accountsResponse.item?.institution_id || 'Plaid Sandbox Institution',
    accounts: accounts.map((account) => ({
      providerAccountId: account.id,
      last4: account.last4,
      subtype: account.subtype
    }))
  });

  return {
    mode: 'plaid_sandbox' as const,
    institutionName: accountsResponse.item?.institution_id || 'Plaid Sandbox Institution',
    accounts,
    transactions,
    persisted: persistence.persisted,
    disclosure: 'Plaid Sandbox only. The access token is used server-side for this request and is not returned to the browser or persisted by this prototype. A successful sandbox response is test evidence, not production provider approval.'
  };
}
