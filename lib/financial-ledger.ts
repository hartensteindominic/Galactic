import { BankingError } from './banking';

export type LedgerAccountCode =
  | 'partner_settlement_cash'
  | 'customer_deposit_liability'
  | 'ach_in_transit_asset'
  | 'ach_return_receivable';

export type LedgerLine = {
  id: string;
  journalId: string;
  eventId: string;
  account: LedgerAccountCode;
  debitCents: number;
  creditCents: number;
  description: string;
};

export type LedgerJournal = {
  id: string;
  eventId: string;
  currency: 'USD';
  createdAt: string;
  lines: LedgerLine[];
};

export type ReconciliationSnapshot = {
  providerAmountCents: number;
  internalAmountCents: number;
  ledgerDebitsCents: number;
  ledgerCreditsCents: number;
  eventCount: number;
  matched: boolean;
  discrepancyCents: number;
};

function requireMoneyCents(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new BankingError(500, 'LEDGER_INVALID_AMOUNT', `${label} must be a non-negative integer number of cents.`);
  }
}

export function summarizeJournal(journal: LedgerJournal) {
  if (!journal.lines.length) {
    throw new BankingError(500, 'LEDGER_EMPTY_JOURNAL', 'A ledger journal must contain at least one line.');
  }

  let debitsCents = 0;
  let creditsCents = 0;

  for (const line of journal.lines) {
    requireMoneyCents(line.debitCents, 'Ledger debit');
    requireMoneyCents(line.creditCents, 'Ledger credit');

    const hasDebit = line.debitCents > 0;
    const hasCredit = line.creditCents > 0;

    if (hasDebit === hasCredit) {
      throw new BankingError(
        500,
        'LEDGER_INVALID_LINE',
        'Each ledger line must contain exactly one positive debit or one positive credit.'
      );
    }

    if (line.journalId !== journal.id || line.eventId !== journal.eventId) {
      throw new BankingError(500, 'LEDGER_REFERENCE_MISMATCH', 'Ledger line references do not match the journal.');
    }

    debitsCents += line.debitCents;
    creditsCents += line.creditCents;
  }

  return {
    debitsCents,
    creditsCents,
    balanced: debitsCents === creditsCents
  };
}

export function assertBalancedJournal(journal: LedgerJournal) {
  const summary = summarizeJournal(journal);
  if (!summary.balanced) {
    throw new BankingError(500, 'LEDGER_OUT_OF_BALANCE', 'Ledger journal debits and credits do not balance.');
  }
  return summary;
}

export function createInboundAchPostedJournal(input: {
  journalId: string;
  eventId: string;
  amountCents: number;
  createdAt: string;
}): LedgerJournal {
  requireMoneyCents(input.amountCents, 'ACH amount');
  if (input.amountCents <= 0) {
    throw new BankingError(500, 'LEDGER_INVALID_AMOUNT', 'ACH amount must be greater than zero.');
  }

  const journal: LedgerJournal = {
    id: input.journalId,
    eventId: input.eventId,
    currency: 'USD',
    createdAt: input.createdAt,
    lines: [
      {
        id: `${input.journalId}-debit`,
        journalId: input.journalId,
        eventId: input.eventId,
        account: 'partner_settlement_cash',
        debitCents: input.amountCents,
        creditCents: 0,
        description: 'Settlement cash asset increase for posted inbound ACH'
      },
      {
        id: `${input.journalId}-credit`,
        journalId: input.journalId,
        eventId: input.eventId,
        account: 'customer_deposit_liability',
        debitCents: 0,
        creditCents: input.amountCents,
        description: 'Customer deposit liability increase for posted inbound ACH'
      }
    ]
  };

  assertBalancedJournal(journal);
  return journal;
}

export function reconcilePostedAmount(input: {
  providerAmountCents: number;
  internalAmountCents: number;
  journal: LedgerJournal;
  eventCount: number;
}): ReconciliationSnapshot {
  requireMoneyCents(input.providerAmountCents, 'Provider reconciliation amount');
  requireMoneyCents(input.internalAmountCents, 'Internal reconciliation amount');

  if (!Number.isSafeInteger(input.eventCount) || input.eventCount < 0) {
    throw new BankingError(500, 'RECONCILIATION_EVENT_COUNT_INVALID', 'Reconciliation event count is invalid.');
  }

  const journalSummary = assertBalancedJournal(input.journal);
  const discrepancyCents = input.providerAmountCents - input.internalAmountCents;
  const matched =
    discrepancyCents === 0 &&
    journalSummary.debitsCents === input.providerAmountCents &&
    journalSummary.creditsCents === input.internalAmountCents &&
    input.eventCount === 1;

  return {
    providerAmountCents: input.providerAmountCents,
    internalAmountCents: input.internalAmountCents,
    ledgerDebitsCents: journalSummary.debitsCents,
    ledgerCreditsCents: journalSummary.creditsCents,
    eventCount: input.eventCount,
    matched,
    discrepancyCents
  };
}
