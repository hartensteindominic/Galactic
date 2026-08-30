'use client';

import { useState } from 'react';

type CertificationResult = {
  runId: string;
  passed: boolean;
  environment: string;
  customer: {
    id: string;
    synthetic: boolean;
    piiStored: boolean;
    kyc: { status: string; realIdentityVerificationPerformed: boolean };
  };
  account: { id: string; type: string; currency: string; synthetic: boolean };
  transfer: { id: string; rail: string; amountCents: number; status: string; realMoneyMoved: boolean };
  webhook: { eventId: string; type: string; signatureVerified: boolean; duplicateRejected: boolean; secretPersisted: boolean; secretReturned: boolean };
  ledger: { entryCount: number; totalDebitsCents: number; totalCreditsCents: number; balanced: boolean };
  reconciliation: {
    providerPostedCents: number;
    internalCustomerBalanceCents: number;
    ledgerDebitsCents: number;
    ledgerCreditsCents: number;
    matched: boolean;
  };
  evidence: Record<string, boolean>;
  safety: {
    syntheticOnly: boolean;
    realMoneyMoved: boolean;
    externalNetworkCalled: boolean;
    providerCredentialsUsed: boolean;
    piiStored: boolean;
  };
  nextStep: string;
};

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function EvidenceRow({ label, pass, detail }: { label: string; pass: boolean; detail?: string }) {
  return (
    <div className="sandboxEvidenceRow">
      <span className={pass ? 'sandboxPassDot' : 'sandboxFailDot'}>{pass ? '✓' : '×'}</span>
      <span><b>{label}</b>{detail ? <small>{detail}</small> : null}</span>
    </div>
  );
}

export function SandboxCertificationClient() {
  const [result, setResult] = useState<CertificationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setRunning(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/banking/sandbox-certification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certification: 'synthetic-zero-money' })
      });
      const body = await response.json();
      if (!response.ok || !body?.ok) {
        throw new Error(body?.error?.message || 'Sandbox certification could not run.');
      }
      setResult(body.result);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Sandbox certification could not run.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="sandboxRunner">
      <div className="sandboxRunnerHeader">
        <div>
          <small>ZERO-MONEY CERTIFICATION</small>
          <h2>Run the complete synthetic banking loop</h2>
          <p>This exercise creates only ephemeral synthetic records. It makes no provider network call, reads no provider credentials, stores no real PII, and moves no money.</p>
        </div>
        <button type="button" onClick={run} disabled={running}>
          {running ? 'Running checks…' : 'Run certification'}
        </button>
      </div>

      {error ? <div className="sandboxError">{error}</div> : null}

      {!result ? (
        <div className="sandboxEmpty">
          <b>What this proves</b>
          <span>Synthetic KYC → account creation → ACH posting → signed webhook verification → duplicate rejection → double-entry ledger → reconciliation.</span>
        </div>
      ) : (
        <div className="sandboxResults">
          <div className={`sandboxVerdict ${result.passed ? 'passed' : 'failed'}`}>
            <span>{result.passed ? '✓' : '!'}</span>
            <div>
              <small>CERTIFICATION RESULT</small>
              <h3>{result.passed ? 'Synthetic flow passed' : 'Synthetic flow blocked'}</h3>
              <p>Run ID: <code>{result.runId}</code></p>
            </div>
          </div>

          <div className="sandboxResultGrid">
            <article>
              <small>1 · CUSTOMER</small>
              <h3>Sandbox KYC</h3>
              <EvidenceRow label="Synthetic customer created" pass={result.customer.synthetic} detail={result.customer.id} />
              <EvidenceRow label="Sandbox KYC approved" pass={result.customer.kyc.status === 'approved_sandbox'} detail="No real identity verification performed" />
              <EvidenceRow label="No real PII stored" pass={!result.customer.piiStored} />
            </article>

            <article>
              <small>2 · ACCOUNT + ACH</small>
              <h3>Simulated money rail</h3>
              <EvidenceRow label="Synthetic checking account created" pass={result.account.synthetic} detail={result.account.id} />
              <EvidenceRow label="Synthetic ACH posted" pass={result.transfer.status === 'posted_sandbox'} detail={`${money(result.transfer.amountCents)} · ${result.transfer.id}`} />
              <EvidenceRow label="No real money moved" pass={!result.transfer.realMoneyMoved} />
            </article>

            <article>
              <small>3 · WEBHOOK</small>
              <h3>Verified + idempotent</h3>
              <EvidenceRow label="HMAC signature verified" pass={result.webhook.signatureVerified} detail={result.webhook.eventId} />
              <EvidenceRow label="Duplicate webhook rejected" pass={result.webhook.duplicateRejected} />
              <EvidenceRow label="Webhook secret never persisted or returned" pass={!result.webhook.secretPersisted && !result.webhook.secretReturned} />
            </article>

            <article>
              <small>4 · LEDGER</small>
              <h3>Double-entry evidence</h3>
              <EvidenceRow label="Ledger balanced" pass={result.ledger.balanced} detail={`${result.ledger.entryCount} entries`} />
              <div className="sandboxMoneyPair"><span>Debits <b>{money(result.ledger.totalDebitsCents)}</b></span><span>Credits <b>{money(result.ledger.totalCreditsCents)}</b></span></div>
            </article>

            <article>
              <small>5 · RECONCILIATION</small>
              <h3>Provider ↔ internal match</h3>
              <EvidenceRow label="Reconciliation matched" pass={result.reconciliation.matched} />
              <div className="sandboxMoneyPair"><span>Provider posted <b>{money(result.reconciliation.providerPostedCents)}</b></span><span>Customer ledger <b>{money(result.reconciliation.internalCustomerBalanceCents)}</b></span></div>
            </article>

            <article>
              <small>6 · SAFETY</small>
              <h3>Production isolation</h3>
              <EvidenceRow label="Synthetic only" pass={result.safety.syntheticOnly} />
              <EvidenceRow label="No external banking network call" pass={!result.safety.externalNetworkCalled} />
              <EvidenceRow label="No provider credentials used" pass={!result.safety.providerCredentialsUsed} />
              <EvidenceRow label="No real money moved" pass={!result.safety.realMoneyMoved} />
            </article>
          </div>

          <div className="sandboxNextStep"><b>Next regulated milestone</b><span>{result.nextStep}</span></div>
        </div>
      )}
    </section>
  );
}
