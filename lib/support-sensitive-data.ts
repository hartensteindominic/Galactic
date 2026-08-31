export type SensitiveSupportCategory =
  | 'payment-card'
  | 'ssn'
  | 'account-or-routing-number'
  | 'authentication-code'
  | 'password-or-passcode'
  | 'api-or-private-key';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function passesLuhn(value: string) {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function hasLikelyPaymentCard(input: string) {
  const candidates = input.match(/(?:\d[ -]?){13,19}/g) || [];
  return candidates.some((candidate) => {
    const digits = digitsOnly(candidate);
    return digits.length >= 13 && digits.length <= 19 && passesLuhn(digits);
  });
}

export function detectSupportSensitiveData(input: string): SensitiveSupportCategory[] {
  const categories = new Set<SensitiveSupportCategory>();
  const text = input.slice(0, 2_000);
  const lower = text.toLowerCase();

  if (hasLikelyPaymentCard(text)) categories.add('payment-card');
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) categories.add('ssn');

  if (/\b(?:routing|aba|account)(?:\s+number|\s+no\.?|\s*#)?\s*[:=-]?\s*\d{8,17}\b/i.test(text)) {
    categories.add('account-or-routing-number');
  }

  if (
    /\b(?:otp|one[- ]?time(?:\s+code)?|verification\s+code|security\s+code)\b/i.test(text) &&
    /\b\d{4,8}\b/.test(text)
  ) {
    categories.add('authentication-code');
  }

  if (/\b(?:pin|password|passcode)\s*[:=-]\s*\S+/i.test(text)) {
    categories.add('password-or-passcode');
  }

  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) ||
    /\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{16,})\b/.test(text) ||
    lower.includes('private_key=')
  ) {
    categories.add('api-or-private-key');
  }

  return [...categories];
}

export function supportSensitiveDataControlStatus() {
  return {
    clientPreflightDetectionAvailable: true,
    serverRejectionRequired: true,
    detectedValuesReturnedToClient: false,
    rawSensitiveMessagePersistenceIntended: false,
    detectionIsNotADataLossPreventionSystem: true,
    disclosure: 'Best-effort prototype detection rejects several high-risk credential/identifier patterns before Orbit answers. It does not replace production DLP, secure identity/document upload flows, logging controls, or approved privacy/security architecture.'
  } as const;
}
