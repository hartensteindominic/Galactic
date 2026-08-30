export type ProductTransparencyItem = {
  id: string;
  name: string;
  category: 'account' | 'money-movement' | 'savings' | 'credit' | 'card' | 'support';
  availability: 'prototype' | 'sandbox' | 'partner-required' | 'unavailable';
  costLabel: string;
  limitsLabel: string;
  eligibilityLabel: string;
  plainEnglish: string;
  liveMoneyEnabled: false;
};

export function prototypeTransparency() {
  const items: ProductTransparencyItem[] = [
    {
      id: 'prototype-account',
      name: 'Prototype account',
      category: 'account',
      availability: 'prototype',
      costLabel: '$0 demo fee',
      limitsLabel: 'Synthetic balances only',
      eligibilityLabel: 'Demo user only',
      plainEnglish: 'This is a simulated account experience. It does not hold deposits, earn interest, provide insurance, or create a real bank account.',
      liveMoneyEnabled: false
    },
    {
      id: 'simulated-transfer',
      name: 'Simulated transfer',
      category: 'money-movement',
      availability: 'prototype',
      costLabel: '$0 demo fee',
      limitsLabel: '$0.01–$10,000 per simulation',
      eligibilityLabel: 'Simulated accounts only',
      plainEnglish: 'Transfers update only the prototype ledger. Idempotency prevents a retry from creating a second persistent demo debit.',
      liveMoneyEnabled: false
    },
    {
      id: 'sandbox-link',
      name: 'Sandbox bank linking',
      category: 'money-movement',
      availability: 'sandbox',
      costLabel: '$0 prototype charge',
      limitsLabel: 'Synthetic institution data only',
      eligibilityLabel: 'Plaid Sandbox when configured, local mock otherwise',
      plainEnglish: 'Account linking exists for testing UX. No production bank credentials or real account access are enabled.',
      liveMoneyEnabled: false
    },
    {
      id: 'cashflow',
      name: 'Cash-flow intelligence',
      category: 'support',
      availability: 'prototype',
      costLabel: '$0 demo fee',
      limitsLabel: '7 / 14 / 30-day simulation horizons',
      eligibilityLabel: 'Prototype users',
      plainEnglish: 'Forecasts are planning estimates based on known prototype items. They are not guarantees, credit decisions, personalized financial advice, or authorization to spend.',
      liveMoneyEnabled: false
    },
    {
      id: 'orbit-support',
      name: 'Orbit automated support',
      category: 'support',
      availability: 'prototype',
      costLabel: '$0 demo fee',
      limitsLabel: 'General product explanations only',
      eligibilityLabel: 'No regulated or account-specific decisioning',
      plainEnglish: 'Orbit is an automated deterministic support assistant. It does not approve or deny credit, determine AML/SAR or sanctions outcomes, decide fraud liability, verify identity, provide legal advice, or give personalized investment recommendations. Material or account-specific judgment requires an authorized human workflow. The prototype does not send customer financial data to a third-party LLM.',
      liveMoneyEnabled: false
    },
    {
      id: 'savings',
      name: 'Savings automation',
      category: 'savings',
      availability: 'partner-required',
      costLabel: 'Not priced',
      limitsLabel: 'No live savings transfers',
      eligibilityLabel: 'Requires approved deposit-account program',
      plainEnglish: 'Goals and planned savings can be simulated. Real interest, APY, deposit insurance, and automated savings transfers require approved partner terms.',
      liveMoneyEnabled: false
    },
    {
      id: 'debit-card',
      name: 'Debit card',
      category: 'card',
      availability: 'partner-required',
      costLabel: 'Not priced',
      limitsLabel: 'No live card limits',
      eligibilityLabel: 'Requires approved issuer/program',
      plainEnglish: 'Card visuals are product UX only. No PAN, CVV, PIN, card issuance, authorization, clearing, or settlement is enabled in the prototype.',
      liveMoneyEnabled: false
    },
    {
      id: 'advance',
      name: 'Cash advance / overdraft-like product',
      category: 'credit',
      availability: 'unavailable',
      costLabel: 'No product / no fee',
      limitsLabel: 'Unavailable',
      eligibilityLabel: 'No credit decisioning in prototype',
      plainEnglish: 'We will not add a live advance or overdraft-like product merely to match competitors. Any future credit product requires legal, compliance, underwriting, servicing, disclosures, and partner approval.',
      liveMoneyEnabled: false
    },
    {
      id: 'credit-builder',
      name: 'Credit builder',
      category: 'credit',
      availability: 'unavailable',
      costLabel: 'No product / no fee',
      limitsLabel: 'Unavailable',
      eligibilityLabel: 'No credit reporting in prototype',
      plainEnglish: 'The prototype does not furnish data to credit bureaus or issue a secured credit card. Any future credit-building product requires an approved issuer and compliant reporting program.',
      liveMoneyEnabled: false
    }
  ];

  return {
    stage: 'prototype',
    hiddenFees: false,
    liveMoneyEnabled: false,
    automatedSupportDisclosed: true,
    regulatedAiDecisioningEnabled: false,
    thirdPartyLlmCustomerDataEnabled: false,
    items,
    disclosure: 'Prototype transparency center. Real fees, limits, rates, insurance statements, eligibility rules, partner disclosures, and any future material AI use must come from approved program terms and governance before launch.'
  } as const;
}
