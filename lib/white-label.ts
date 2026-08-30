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

function parseConfiguredBrands(): WhiteLabelBrand[] {
  const raw = process.env.WHITE_LABEL_TENANTS_JSON?.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((brand): brand is WhiteLabelBrand => {
      if (!brand || typeof brand !== 'object') return false;
      const candidate = brand as Partial<WhiteLabelBrand>;
      return Boolean(
        candidate.key &&
        candidate.name &&
        candidate.shortName &&
        candidate.legalName &&
        candidate.supportEmail &&
        candidate.accent &&
        candidate.accentSecondary &&
        candidate.logoText &&
        Array.isArray(candidate.domains) &&
        candidate.productDisclosure &&
        candidate.bankingDisclosure
      );
    });
  } catch {
    return [];
  }
}

export function configuredBrands(): WhiteLabelBrand[] {
  const configured = parseConfiguredBrands();
  const hasDefaultOverride = configured.some((brand) => brand.key === DEFAULT_BRAND.key);
  return hasDefaultOverride ? configured : [DEFAULT_BRAND, ...configured];
}

function normalizedHost(value: string) {
  return value.toLowerCase().split(':')[0].trim();
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
