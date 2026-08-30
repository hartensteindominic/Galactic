import { bankingStatus } from './banking';
import { cryptoStatus } from './crypto';
import { getPrototypeCustomerTerms, requireApprovedLiveCustomerTerms } from './customer-terms-control';

export type AssistantReply = {
  message: string;
  suggestions: string[];
  requiresHuman?: boolean;
  policyArea?: 'general' | 'security' | 'privacy' | 'credit' | 'aml-sanctions' | 'fraud-dispute' | 'identity' | 'investment' | 'insurance' | 'legal';
  termsVersion?: string;
};

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function humanReply(
  message: string,
  policyArea: Exclude<AssistantReply['policyArea'], undefined>,
  suggestions: string[] = ['Contact support', 'Security & privacy', 'Product status']
): AssistantReply {
  return { message, suggestions, requiresHuman: true, policyArea };
}

export function answerGalacticQuestion(input: string): AssistantReply {
  const text = input.trim().toLowerCase().slice(0, 500);
  const banking = bankingStatus();
  const crypto = cryptoStatus();
  const terms = getPrototypeCustomerTerms();
  const demoNotice = banking.mode === 'demo'
    ? 'Galactic Trust is currently in demo banking mode, so no real deposits or money movement occur yet.'
    : banking.disclosure;

  if (!text) {
    return {
      message: 'Ask me about transfers, cards, crypto, security, privacy, product status, or how Galactic Trust works.',
      suggestions: ['How do transfers work?', 'Is my data private?', 'What can Orbit do?'],
      policyArea: 'general'
    };
  }

  if (includesAny(text, ['are you ai', 'are you human', 'chatbot', 'what can orbit do', 'what are you'])) {
    return {
      message: 'I’m Orbit, an automated support assistant. I can explain product status and general features, but I do not make account, credit, fraud, identity, compliance, legal, or investment decisions. Questions that require regulated or account-specific judgment must go to an authorized human support or compliance workflow.',
      suggestions: ['Product status', 'Contact support', 'Security & privacy'],
      policyArea: 'general'
    };
  }

  if (includesAny(text, ['loan', 'borrow', 'credit score', 'credit decision', 'approved for credit', 'credit limit', 'underwriting', 'apr', 'interest rate for loan', 'denied credit', 'why was i denied'])) {
    return humanReply(
      banking.mode === 'demo'
        ? 'Galactic Trust does not offer or decide live credit in this prototype. Orbit cannot approve, deny, price, underwrite, or explain an account-specific credit decision. Any future credit product would require an approved program, applicable fair-lending and consumer-credit controls, and accurate legally required notices.'
        : 'Orbit cannot approve, deny, price, underwrite, or explain an account-specific credit decision. Use the authorized human support channel for any credit decision or adverse-action question.',
      'credit',
      ['Contact support', 'Product status', 'Fees & limits']
    );
  }

  if (includesAny(text, ['sar', 'suspicious activity report', 'aml', 'money laundering', 'ofac', 'sanctions', 'sanctioned', 'watchlist', 'terrorist list', 'will you report me'])) {
    return humanReply(
      'Orbit cannot determine or disclose whether a suspicious-activity report exists, whether one may be filed, or the result of internal AML/sanctions monitoring. Do not send identity documents or sensitive financial information in chat. Account-specific compliance questions must be handled through an authorized human compliance/support workflow.',
      'aml-sanctions',
      ['Contact support', 'Privacy', 'What should I never share?']
    );
  }

  if (includesAny(text, ['fraud', 'unauthorized', 'chargeback', 'dispute', 'merchant dispute', 'stolen money', 'transaction i do not recognize', 'transaction i don’t recognize', 'scammed'])) {
    return humanReply(
      banking.mode === 'demo'
        ? 'The prototype cannot open a real fraud claim, dispute, chargeback, or reimbursement case. If this were a live account issue, it would require an authenticated human support and dispute workflow. Never send passwords, PINs, CVVs, recovery codes, or one-time codes in chat.'
        : 'For suspected fraud or an unauthorized transaction, use the authenticated support/dispute channel immediately. Orbit can provide general guidance but cannot decide liability, reimbursement, chargeback eligibility, or close a fraud investigation.',
      'fraud-dispute',
      ['Freeze my card', 'Contact support', 'Security protections']
    );
  }

  if (includesAny(text, ['verify my identity', 'identity verification', 'kyc', 'kyb', 'upload id', 'passport', 'driver license', 'social security', 'ssn'])) {
    return humanReply(
      'Do not send identity documents, Social Security numbers, tax IDs, or other sensitive verification data in this chat. Orbit does not perform KYC/KYB or identity adjudication. Any future live verification must use an approved protected workflow and authorized provider/human review where required.',
      'identity',
      ['Contact support', 'Privacy', 'Security protections']
    );
  }

  if (includesAny(text, ['is this legal', 'legal advice', 'what law', 'am i legally', 'sue', 'lawyer', 'regulator', 'regulatory'])) {
    return humanReply(
      'Orbit can describe Galactic Trust’s current product status, but it does not provide legal advice or make regulatory determinations. Customer-facing legal, regulatory, licensing, and disclosure questions must be answered from approved program materials or escalated to qualified human counsel/compliance personnel.',
      'legal',
      ['Product status', 'Contact support', 'Transparency']
    );
  }

  if (includesAny(text, ['hello', 'hi ', 'hey', 'good morning', 'good evening'])) {
    return {
      message: `Hi! I’m Orbit, the Galactic Trust automated support assistant. ${demoNotice}`,
      suggestions: ['Transfer money', 'Product status', 'Security & privacy'],
      policyArea: 'general'
    };
  }

  if (includesAny(text, ['transfer', 'send money', 'send cash'])) {
    if (banking.mode !== 'demo') requireApprovedLiveCustomerTerms();
    return {
      message: `Tap Transfer on the dashboard, enter a recipient and amount, then choose Simulate Transfer. ${terms.transferDisclosure}`,
      suggestions: ['Add money', 'Freeze my card', 'Is this secure?'],
      policyArea: 'general',
      termsVersion: terms.version
    };
  }

  if (includesAny(text, ['add money', 'deposit', 'fund account', 'direct deposit', 'ach'])) {
    if (banking.mode !== 'demo') requireApprovedLiveCustomerTerms();
    return {
      message: terms.fundingDisclosure,
      suggestions: ['How do transfers work?', 'Security & privacy', 'Cards'],
      policyArea: 'general',
      termsVersion: terms.version
    };
  }

  if (includesAny(text, ['freeze', 'lost card', 'stolen card', 'card stolen', 'lock card'])) {
    return {
      message: banking.mode === 'demo'
        ? 'Use Freeze Card on the dashboard to simulate locking the Nebula Blue card. No real card is affected in demo mode.'
        : 'Use the authenticated Freeze Card control immediately if your card is lost or stolen. For suspected fraud, also use the verified support channel shown inside your account.',
      suggestions: ['View card', 'Security protections', 'Contact support'],
      policyArea: 'security'
    };
  }

  if (includesAny(text, ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'usdc', 'buy coin', 'sell coin'])) {
    return {
      message: crypto.mode === 'demo'
        ? 'The Crypto panel lets you simulate buying and selling BTC, ETH, and USDC using clearly labeled demo prices. No real crypto is purchased or sold until an approved provider is connected and live trading is explicitly enabled.'
        : `${crypto.disclosure} Crypto can lose value. Orbit does not provide personalized investment recommendations or promises of return.`,
      suggestions: ['How crypto works', 'Crypto risks', 'Security'],
      policyArea: 'investment'
    };
  }

  if (includesAny(text, ['safe', 'secure', 'security', 'protect', '2fa', 'two factor'])) {
    return {
      message: 'The current prototype includes server-only secrets, signed sessions for protected banking paths, same-origin checks, restrictive browser security headers, transfer idempotency controls, bounded request bodies, tenant-host isolation, and fail-closed live-write controls. These controls reduce risk but are not a guarantee that any system is perfectly secure. Never share passwords, PINs, CVVs, recovery codes, or one-time codes in chat.',
      suggestions: ['Privacy', 'Freeze my card', 'What should I never share?'],
      policyArea: 'security'
    };
  }

  if (includesAny(text, ['privacy', 'data', 'tracking', 'chat history', 'store my'])) {
    return {
      message: 'Orbit is designed for general support and does not need passwords, PINs, CVVs, recovery codes, one-time codes, full account/card numbers, Social Security numbers, or identity documents. The current app does not intentionally persist Orbit messages in its prototype database. Future live use of customer data or third-party AI services must follow approved privacy, security, retention, vendor-management, and disclosure requirements.',
      suggestions: ['Security protections', 'What should I never share?', 'Contact support'],
      policyArea: 'privacy'
    };
  }

  if (includesAny(text, ['fdic', 'insured', 'bank insured', 'deposit insurance', 'member fdic'])) {
    if (banking.mode !== 'demo') requireApprovedLiveCustomerTerms();
    return {
      message: terms.depositInsuranceDisclosure,
      suggestions: ['How Galactic Trust works', 'Transparency', 'Contact support'],
      policyArea: 'insurance',
      termsVersion: terms.version
    };
  }

  if (includesAny(text, ['fee', 'fees', 'cost', 'price', 'apy', 'yield', 'interest earned'])) {
    if (banking.mode !== 'demo') requireApprovedLiveCustomerTerms();
    return {
      message: terms.feeRateDisclosure,
      suggestions: ['Transparency', 'Transfers', 'Product status'],
      policyArea: 'general',
      termsVersion: terms.version
    };
  }

  if (includesAny(text, ['reward', 'stars', 'cashback'])) {
    if (banking.mode !== 'demo') requireApprovedLiveCustomerTerms();
    return {
      message: terms.rewardsDisclosure,
      suggestions: ['Cards', 'Product status', 'Transparency'],
      policyArea: 'general',
      termsVersion: terms.version
    };
  }

  if (includesAny(text, ['balance', 'account number', 'routing number', 'cvv', 'pin', 'password', 'one time code', 'otp'])) {
    return {
      message: 'For your security, Orbit will not ask for or reveal passwords, PINs, CVVs, recovery codes, one-time codes, full account/card numbers, Social Security numbers, or identity documents in chat. Use protected account and verification screens for sensitive details.',
      suggestions: ['Security protections', 'Privacy', 'Contact support'],
      policyArea: 'security'
    };
  }

  if (includesAny(text, ['investment advice', 'what should i buy', 'should i buy', 'will bitcoin', 'guaranteed profit', 'best investment', 'buy or sell'])) {
    return humanReply(
      'Orbit can explain product mechanics and general risk disclosures, but it cannot promise returns or provide personalized recommendations to buy, sell, or hold an investment or crypto asset. Use an appropriately qualified human professional when personalized advice is needed.',
      'investment',
      ['How crypto works', 'Crypto risks', 'Contact support']
    );
  }

  if (includesAny(text, ['safe to spend', 'can i afford', 'can i spend'])) {
    return {
      message: terms.cashflowDisclosure,
      suggestions: ['Safe-to-Spend', 'Why can this change?', 'Transparency'],
      policyArea: 'general',
      termsVersion: terms.version
    };
  }

  if (includesAny(text, ['human', 'agent', 'support', 'help center', 'contact', 'complaint'])) {
    return humanReply(
      'For account-specific issues, complaints, fraud reports, identity verification, disputes, compliance questions, or anything requiring regulated judgment, use the verified human support channel shown inside the authenticated product. Never trust support requests asking for your PIN, CVV, password, recovery code, or one-time code.',
      'general',
      ['Security protections', 'Freeze my card', 'Privacy']
    );
  }

  return {
    message: `I can explain Galactic Trust product status, transfers, cards, crypto, rewards, security, privacy, and prototype features. I do not make regulated or account-specific decisions. ${demoNotice}`,
    suggestions: ['How do transfers work?', 'What can Orbit do?', 'Is my data private?'],
    policyArea: 'general'
  };
}