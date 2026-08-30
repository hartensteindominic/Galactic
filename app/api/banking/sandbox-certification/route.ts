import { requireBankingUser } from '../../../../../lib/banking-auth';
import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { requireJsonRequest, requireTrustedOrigin } from '../../../../../lib/request-security';
import { runSandboxCertification, sandboxCertificationStatus } from '../../../../../lib/sandbox-certification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return bankingJson({
    ok: true,
    status: sandboxCertificationStatus()
  });
}

export async function POST(request: Request) {
  try {
    requireJsonRequest(request);
    requireTrustedOrigin(request);
    const userId = requireBankingUser(request);
    const result = runSandboxCertification(userId);

    return bankingJson({
      ok: true,
      result
    }, 201);
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
