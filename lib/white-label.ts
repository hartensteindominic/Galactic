import { BankingError } from './banking';

export type WhiteLabelBrand = {
  key: string;
  name: string;
  shortName: string;
  legalName: string;
  supportEmail: string;
  accent: string;
  accentSecondary: string;
  logoText: string;
  domains: string[];
  productDisclosure: string;
  bankingDisclosure: string;
};

const DEFAULT_BRAND: WhiteLabelBrand = {
  key: 'galactic-trust',
  name: 'Galactic Trust',
  shortName: 'Galactic',
  legalName: 'Galactic Trust',
  supportEmail: 'support@example.com',
  accent: '#7c3aed',
  accentSecondary: '#22d3ee',
  logoText: 'GT',
  domains: ['localhost'],
  productDisclosure: 'Prototype financial dashboard. Demo balances and transactions are simulated.',
  bankingDisclosure: 'Demo mode. No real deposits are held and no real money is moved.'
};

function configurationError(message: string): never {
  throw new BankingError(500, 'WHITE_LABEL_CONFIG_INVALID', message);
}

function normalizedHost(value: string) {
  const raw = value.trim().toLowerCase();
  if (!raw) return '';
  if (raw.startsWith('[')) {
    const closingBracket = raw.indexOf(']');
    if (closingBracket > 0) return raw.slice(1, closingBracket).replace(/\.$/, '');
  }
  return raw.replace(/:\d+$/, '').replace(/\.$/, '');
}

function validBrand(candidate: unknown, index: number): WhiteLabelBrand {
  if (!candidate || typeof candidate !== 'object') {
    return configurationError(`White-label tenant entry ${index + 1} must be an object.`);
  }

  const brand = candidate as Partial<WhiteLabelBrand>;
  const requiredStrings: Array<keyof Omit<WhiteLabelBrand, 'domains'>> = [
    'key',
    'name',
    'shortName',
    'legalName',
    'supportEmail',
    'accent',
    'accentSecondary',
    'logoText',
    'productDisclosure',
    'bankingDisclosure'
  ];

  for (const field of requiredStrings) {
    if (typeof brand[field] !== 'string' || !brand[field]?.trim()) {
      return configurationError(`White-label tenant entry ${index + 1} is missing required field ${field}.`);
    }
  }

  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(brand.key as string)) {
    return configurationError(`White-label tenant entry ${index + 1} has an invalid canonical tenant key.`);
  }

  if (!Array.isArray(brand.domains) || brand.domains.some((domain) => typeof domain !== 'string' || !normalizedHost(domain))) {
    return configurationError(`White-label tenant entry ${index + 1} has an invalid domains list.`);
  }

  for (const domain of brand.domains) {
    if (domain.includes('://') || domain.includes('/') || /\s/.test(domain)) {
      return configurationError(`White-label tenant entry ${index + 1} contains a domain that is not a hostname.`);
    }
  }

  return brand as WhiteLabelBrand;
}

function parseConfiguredBrands(): WhiteLabelBrand[] {
  const raw = process.env.WHITE_LABEL_TENANTS_JSON?.trim();
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return configurationError('WHITE_LABEL_TENANTS_JSON must contain valid JSON.');
  }

  if (!Array.isArray(parsed)) {
    return configurationError('WHITE_LABEL_TENANTS_JSON must contain an array of tenant objects.');
  }

  return parsed.map((brand, index) => validBrand(brand, index));
}

function validateUniqueRouting(brands: WhiteLabelBrand[]) {
  const keys = new Map<string, string>();
  const domains = new Map<string, string>();

  for (const brand of brands) {
    const canonicalKey = brand.key.toLowerCase();
    const previousKeyOwner = keys.get(canonicalKey);
    if (previousKeyOwner) {
      configurationError(`Duplicate white-label tenant key detected for ${canonicalKey}.`);
    }
    keys.set(canonicalKey, brand.key);

    const localDomains = new Set<string>();
    for (const rawDomain of brand.domains) {
      const domain = normalizedHost(rawDomain);
      if (localDomains.has(domain)) {
        configurationError(`Tenant ${brand.key} contains duplicate hostname ${domain}.`);
      }
      localDomains.add(domain);

      const previousDomainOwner = domains.get(domain);
      if (previousDomainOwner && previousDomainOwner !== brand.key) {
        configurationError(`Hostname ${domain} is assigned to more than one white-label tenant.`);
      }
      domains.set(domain, brand.key);
    }
  }
}

export function configuredBrands(): WhiteLabelBrand[] {
  const configured = parseConfiguredBrands();
  const hasDefaultOverride = configured.some((brand) => brand.key === DEFAULT_BRAND.key);
  const brands = hasDefaultOverride ? configured : [DEFAULT_BRAND, ...configured];
  validateUniqueRouting(brands);
  return brands;
}

export function resolveBrand(input?: { host?: string | null; key?: string | null }): WhiteLabelBrand {
  const brands = configuredBrands();
  const requestedKey = input?.key?.trim().toLowerCase();
  if (requestedKey) {
    const byKey = brands.find((brand) => brand.key.toLowerCase() === requestedKey);
    if (byKey) return byKey;
  }

  const host = normalizedHost(input?.host || '');
  if (host) {
    const byDomain = brands.find((brand) => brand.domains.some((domain) => normalizedHost(domain) === host));
    if (byDomain) return byDomain;
  }

  return brands.find((brand) => brand.key === DEFAULT_BRAND.key) || brands[0] || DEFAULT_BRAND;
}

export function publicBrandConfig(brand: WhiteLabelBrand) {
  return {
    key: brand.key,
    name: brand.name,
    shortName: brand.shortName,
    legalName: brand.legalName,
    supportEmail: brand.supportEmail,
    accent: brand.accent,
    accentSecondary: brand.accentSecondary,
    logoText: brand.logoText,
    productDisclosure: brand.productDisclosure,
    bankingDisclosure: brand.bankingDisclosure
  };
}
