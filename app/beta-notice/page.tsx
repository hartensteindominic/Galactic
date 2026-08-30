export default function BetaNotice() {
  return (
    <main className="privacyPage">
      <a className="privacyBack" href="/">← Back to Galactic Trust</a>

      <section className="privacyHero">
        <span className="privacyShield">β</span>
        <div>
          <p>PUBLIC BETA NOTICE</p>
          <h1>Galactic Trust is a financial-technology demo.</h1>
          <span>
            This beta is designed to demonstrate the product experience while regulated banking and crypto services remain disabled until approved providers, program agreements, compliance review, and customer disclosures are in place.
          </span>
        </div>
      </section>

      <section className="privacyGrid">
        <article>
          <span>01</span>
          <h2>Not a chartered bank</h2>
          <p>Galactic Trust is not currently operating as a chartered bank. The beta does not itself create a real deposit account or banking relationship.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Demo balances</h2>
          <p>Balances, transaction history, cards, transfers, rewards, spending insights, and similar financial information shown in the beta are sample or simulated data unless the interface explicitly says otherwise.</p>
        </article>
        <article>
          <span>03</span>
          <h2>No real deposits</h2>
          <p>Galactic Trust does not accept or hold real customer deposits in this beta. Do not send money to any account, wallet, address, or payment instruction unless a future approved live product explicitly provides that instruction.</p>
        </article>
        <article>
          <span>04</span>
          <h2>Cards are previews</h2>
          <p>Card designs and controls are product previews. They are not evidence that a Visa, Mastercard, sponsor-bank, or card-issuing relationship is active.</p>
        </article>
        <article>
          <span>05</span>
          <h2>Crypto is simulated</h2>
          <p>Crypto holdings and trades shown in the beta are simulated. Galactic Trust does not use this beta to custody customer private keys or execute real customer crypto orders.</p>
        </article>
        <article>
          <span>06</span>
          <h2>No guaranteed returns</h2>
          <p>Nothing in the beta is a promise of interest, profit, yield, investment performance, credit approval, deposit insurance, or future product availability.</p>
        </article>
      </section>

      <section className="privacyCallout">
        <div>
          <strong>Before any live financial service launches</strong>
          <span>Program-specific terms, privacy notices, eligibility rules, fees, regulated-provider disclosures, and other required notices must be reviewed and published for the actual approved program.</span>
        </div>
        <a href="/compliance">View Compliance Center</a>
      </section>
    </main>
  );
}
