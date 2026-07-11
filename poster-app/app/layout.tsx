import type { Metadata } from 'next';
import { Oswald, Poppins } from 'next/font/google';
import './globals.css';

// These fonts are for the FORM UI only.
// The poster render (satori API route) loads fonts separately as ArrayBuffers.
// See: lib/fontLoader.ts
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AUSTCAIC Poster Generator',
  description:
    'Internal tool for the AUSTCAIC graphics team. Generate print-ready posters at 300 DPI with a fixed design system — no design software needed.',
  robots: 'noindex, nofollow', // internal tool — don't index
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${poppins.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
