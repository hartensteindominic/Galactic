export type PrototypeEvidenceFreshnessState =
  | 'none'
  | 'recent-evidence'
  | 'stale-evidence'
  | 'invalid-evidence'
  | 'future-evidence';

export type PrototypeEvidenceFreshness = {
  state: PrototypeEvidenceFreshnessState;
  evidencePresent: boolean;
  latestObservedAt: string | null;
  ageMs: number | null;
  recentWindowMs: number;
  futureToleranceMs: number;
  continuousMonitoringVerified: false;
  productionHealthVerified: false;
  providerStatementReconciliationVerified: false;
  disclosure: string;
};

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export function evaluatePrototypeEvidenceFreshness(
  timestamps: readonly string[],
  nowMs = Date.now()
): PrototypeEvidenceFreshness {
  const base = {
    recentWindowMs: RECENT_WINDOW_MS,
    futureToleranceMs: FUTURE_TOLERANCE_MS,
    continuousMonitoringVerified: false as const,
    productionHealthVerified: false as const,
    providerStatementReconciliationVerified: false as const
  };

  if (timestamps.length === 0) {
    return {
      ...base,
      state: 'none',
      evidencePresent: false,
      latestObservedAt: null,
      ageMs: null,
      disclosure: 'No stored prototype evidence timestamp is available. This does not imply a healthy or unhealthy production system.'
    };
  }

  const parsed = timestamps.map((value) => ({ value, time: Date.parse(value) }));
  if (parsed.some((entry) => !Number.isFinite(entry.time))) {
    return {
      ...base,
      state: 'invalid-evidence',
      evidencePresent: true,
      latestObservedAt: null,
      ageMs: null,
      disclosure: 'At least one stored prototype evidence timestamp is invalid. Treat freshness as unknown rather than inferring system health.'
    };
  }

  const latest = parsed.reduce((best, entry) => entry.time > best.time ? entry : best);
  if (latest.time > nowMs + FUTURE_TOLERANCE_MS) {
    return {
      ...base,
      state: 'future-evidence',
      evidencePresent: true,
      latestObservedAt: latest.value,
      ageMs: null,
      disclosure: 'The latest stored prototype evidence timestamp is unexpectedly in the future. Treat freshness as unknown and investigate clock/data integrity.'
    };
  }

  const ageMs = Math.max(0, nowMs - latest.time);
  const recent = ageMs <= RECENT_WINDOW_MS;

  return {
    ...base,
    state: recent ? 'recent-evidence' : 'stale-evidence',
    evidencePresent: true,
    latestObservedAt: latest.value,
    ageMs,
    disclosure: recent
      ? 'Recent stored prototype evidence exists. Recency does not prove continuous monitoring, production health, provider-statement reconciliation, or readiness for customer funds.'
      : 'Stored prototype evidence exists but is older than the 24-hour evidence window. Staleness is an evidence-age signal, not a transaction outcome or production-health determination.'
  };
}

export function prototypeEvidenceFreshnessControlStatus() {
  return {
    modelImplemented: true,
    recentWindowHours: 24,
    futureClockToleranceMinutes: 5,
    invalidTimestampFailsUnknown: true,
    futureTimestampFailsUnknown: true,
    recencyIsNotHealth: true,
    continuousMonitoringVerified: false,
    productionHealthVerified: false,
    providerStatementReconciliationVerified: false
  } as const;
}
