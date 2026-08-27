import { LicenseConsole } from './license-console';
import { baseUsdcPaymentUri, metamaskSendLink } from '../lib/config';
import { licensePrice, x402Status } from '../lib/x402';

export const dynamic = 'force-dynamic';

export default function Home() {
  const status = x402Status();
  const price = licensePrice();
  const payNowUri = baseUsdcPaymentUri(status.payTo);
  const walletLink = metamaskSendLink(status.payTo);

  return (
    <main>
      <section className="shell">
        <nav className="topbar">
          <a className="brand" href="/">GALACTIC</a>
          <div className="navPill">x402 Base USDC</div>
        </nav>

        <section className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">Machine-payable asset rights</p>
            <h1>Charge AI agents for one licensed asset use.</h1>
            <p className="lead">
              Galactic now exposes a free machine catalog and a paid x402 endpoint.
              Buyers can pay your MetaMask wallet directly, while agents can discover
              an eligible VoxelFlip NFT, pay {price} on Base, and
              receive exactly one machine-use license receipt.
            </p>
            <div className="heroActions">
              <a className="primaryAction" href={payNowUri}>Pay {price} USDC now</a>
              <a className="secondaryAction" href={walletLink}>Open MetaMask</a>
              <a className="secondaryAction" href="/api/licenses/catalog">Free catalog</a>
            </div>
          </div>

          <div className="statusPanel" aria-label="Revenue status">
            <div>
              <span>Payment receiver</span>
              <strong>{status.payToShort}</strong>
            </div>
            <div>
              <span>Network</span>
              <strong>Base mainnet</strong>
            </div>
            <div>
              <span>License price</span>
              <strong>{price} USDC</strong>
            </div>
            <div>
              <span>Settlement</span>
              <strong>{status.configured ? 'Ready' : 'Needs config'}</strong>
            </div>
          </div>
        </section>

        <LicenseConsole price={price} payTo={status.payTo} payNowUri={payNowUri} walletLink={walletLink} />

        <section className="explainGrid">
          <article>
            <span>01</span>
            <h2>Catalog is free</h2>
            <p>Agent clients can inspect token ID, contract, owner, token URI, and license terms before deciding to pay.</p>
          </article>
          <article>
            <span>02</span>
            <h2>x402 gates the receipt</h2>
            <p>The paid route uses the official Next.js x402 wrapper, so settlement is tied to a successful API response.</p>
          </article>
          <article>
            <span>03</span>
            <h2>One use only</h2>
            <p>Every paid response issues one non-transferable machine-use unit. Reuse means another x402 payment.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
