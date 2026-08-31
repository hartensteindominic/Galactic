import type { Metadata } from 'next';
import './globals.css';
import './banking-controls.css';
import './extras.css';
import './privacy.css';
import './privacy-link.css';

export const metadata: Metadata = {
  title: 'Galactic Trust | Online Banking Experience Demo',
  description: 'A simulation-only online banking experience for accounts, transfers, cards, bills, savings, and money insights. Real financial services require an approved regulated partner program.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
