import { NextResponse } from 'next/server';
import { answerGalacticQuestion } from '../../../lib/assistant';
import { bankingErrorResponse } from '../../../lib/banking-http';
import { getPrototypeCustomerTerms } from '../../../lib/customer-terms-control';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin, safeClientIp } from '../../../lib/request-security';
import { supportCaseControlStatus } from '../../../lib/support-case-state';
import { detectSupportSensitiveData, supportSensitiveDataControlStatus } from '../../../lib/support-sensitive-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const LIMIT = 24;
const MAX_BODY_BYTES = 4_096;
const buckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || current.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= LIMIT) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    requireJsonRequest(request);
    requireTrustedOrigin(request);

    const ip = safeClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        ok: false,
        error: { code: 'RATE_LIMITED', message: 'Orbit is receiving too many messages. Please try again in a moment.' }
      }, {
        status: 429,
        headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' }
      });
    }

    const body = await readJsonBodyLimited<{ message?: unknown }>(request, MAX_BODY_BYTES);
    const message = String(body.message || '').trim();
    if (!message || message.length > 500) {
      return NextResponse.json({
        ok: false,
        error: { code: 'INVALID_MESSAGE', message: 'Please enter a support question under 500 characters.' }
      }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const sensitiveCategories = detectSupportSensitiveData(message);
    if (sensitiveCategories.length > 0) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'SENSITIVE_DATA_REJECTED',
          message: 'Remove sensitive financial, identity, authentication, or credential data and ask again using masked or general details.',
          detectedCategories: sensitiveCategories
        }
      }, {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      });
    }

    const reply = answerGalacticQuestion(message);
    const prototypeTerms = getPrototypeCustomerTerms();
    const supportCases = supportCaseControlStatus();
    const sensitiveDataControls = supportSensitiveDataControlStatus();

    return NextResponse.json({
      ok: true,
      reply,
      assistantDisclosure: {
        automated: true,
        regulatedDecisioningEnabled: false,
        accountSpecificDecisioningEnabled: false,
        thirdPartyLlmCustomerDataEnabled: false,
        productionHumanCaseManagementConnected: supportCases.approvedProductionCaseSystemConnected,
        automationMayResolveSupportCase: supportCases.automationMayResolveCase,
        automationMayCloseSupportCase: supportCases.automationMayCloseCase,
        sensitiveDataPatternDetectionEnabled: sensitiveDataControls.clientPreflightDetectionAvailable,
        sensitiveDataDetectionIsProductionDlp: false,
        prototypeTermsVersion: prototypeTerms.version,
        liveCustomerTermsApproved: prototypeTerms.liveTermsApproved
      }
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}