import { BankingError } from './banking';
import { configuredBrands, resolveBrand, type WhiteLabelBrand } from './white-label';

function normalizedHost(value: string | null | undefined) {
  return (value || '').toLowerCase().split(':')[0].trim();
}

function isPreviewOverrideHost(host: string) {
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  return process.env.VERCEL_ENV === 'preview' && host.endsWith('.vercel.app');
}

function brandForDomain(host: string): WhiteLabelBrand | null {
  if (!host) return null;
  return configuredBrands().find((brand) => (
    brand.domains.some((domain) => normalizedHost(domain) === host)
  )) || null;
}

function brandForKey(key: string | null | undefined): WhiteLabelBrand | null {
  const normalized = key?.trim().toLowerCase() || '';
  if (!normalized) return null;
  return configuredBrands().find((brand) => brand.key.toLowerCase() === normalized) || null;
}

function requireKnownRequestedBrand(key: string | null | undefined) {
  const requested = key?.trim() || '';
  if (!requested) return null;
  const brand = brandForKey(requested);
  if (!brand) {
    throw new BankingError(404, 'UNKNOWN_TENANT', 'The requested tenant is not configured.');
  }
  return brand;
}

export function resolveRequestBrand(input: {
  host?: string | null;
  requestedKey?: string | null;
}): WhiteLabelBrand {
  const host = normalizedHost(input.host);
  const hostBrand = brandForDomain(host);
  const requestedBrand = requireKnownRequestedBrand(input.requestedKey);

  if (hostBrand) {
    if (requestedBrand && requestedBrand.key !== hostBrand.key) {
      throw new BankingError(
        403,
        'TENANT_HOST_MISMATCH',
        'The requested tenant does not match this application hostname.'
      );
    }
    return hostBrand;
  }

  if (isPreviewOverrideHost(host)) {
    return requestedBrand || resolveBrand({ host });
  }

  if (requestedBrand) {
    throw new BankingError(
      403,
      'TENANT_QUERY_OVERRIDE_FORBIDDEN',
      'Tenant selection by query/body is disabled on unrecognized production hostnames.'
    );
  }

  return resolveBrand({ host });
}

export function resolveAuthenticatedServerTenant(requestedKey: string | null | undefined): WhiteLabelBrand {
  if (!requestedKey?.trim()) {
    throw new BankingError(400, 'TENANT_REQUIRED', 'An explicit tenant is required for this authenticated server-to-server route.');
  }
  return requireKnownRequestedBrand(requestedKey) as WhiteLabelBrand;
}

export function tenantBoundaryStatus() {
  return {
    productionHostBinding: true,
    previewTenantOverrideAllowed: true,
    previewOverrideRequiresExplicitVercelPreviewEnvironment: true,
    crossTenantHostOverrideRejected: true,
    unknownTenantRejected: true,
    authenticatedServerRoutesRequireExplicitTenant: true
  } as const;
}
