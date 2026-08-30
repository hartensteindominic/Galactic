export default function SupportPage() {
  return (
    <main className="privacyPage">
      <a className="privacyBack" href="/">← Back to Galactic Trust</a>

      <section className="privacyHero">
        <span className="privacyShield">?</span>
        <div>
          <p>SUPPORT &amp; SAFETY</p>
          <h1>Get help without sharing sensitive credentials.</h1>
          <span>
            Galactic Trust is currently a demo/beta. Support can help explain the product and investigate application issues, but the beta does not provide live banking, card, deposit, lending, or crypto-custody services.
          </span>
        </div>
      </section>

      <section className="privacyGrid">
        <article>
          <span>01</span>
          <h2>Never share secrets</h2>
          <p>Do not send passwords, PINs, CVVs, one-time authentication codes, recovery phrases, private keys, or full card/account credentials to Orbit or support.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Beta product issues</h2>
          <p>For display, sign-in, navigation, simulated transfer, simulated card, or simulated crypto issues, report what you were trying to do and the non-sensitive error message you saw.</p>
        </article>
        <article>
          <span>03</span>
          <h2>No live transaction disputes yet</h2>
          <p>The current beta does not move real customer money. A future live program will publish the approved dispute, error-resolution, complaint, and escalation process before real transactions are enabled.</p>
        </article>
        <article>
          <span>04</span>
          <h2>Security reports</h2>
          <p>If you believe you found a security issue, avoid accessing other users&apos; data or testing with real financial credentials. Report only the minimum information needed to reproduce the issue safely.</p>
        </article>
        <article>
          <span>05</span>
          <h2>Compliance questions</h2>
          <p>The Compliance Center shows whether partner, disclosure, compliance, and live-money readiness gates are enabled. Demo users should expect live-money readiness to remain off.</p>
        </article>
        <article>
          <span>06</span>
          <h2>Future live support</h2>
          <p>Before a regulated product launches, this page must be updated with the approved support channel, hours, complaint handling, emergency card/account procedures, and required regulatory notices.</p>
        </article>
      </section>

      <section className="privacyCallout">
        <div>
          <strong>Need product-status information?</strong>
          <span>Use the public readiness pages rather than guessing whether a feature is live.</span>
        </div>
        <a href="/compliance">Open Compliance Center</a>
      </section>
    </main>
  );
}
