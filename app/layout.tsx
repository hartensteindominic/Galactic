import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Galactic x402 Licensing',
  description: 'A Base USDC x402 machine-use licensing API for AI agents and digital asset buyers.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
