import './globals.css';
import { SITE_URL } from '../lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Marco Arpa | Unabhängige Finanzberatung',
  description: 'Personalisierte und unabhängige Finanzberatung. Altersvorsorge, Versicherungen, Geldanlage und Immobilienfinanzierung.',
  keywords: 'Finanzberatung, Altersvorsorge, Versicherung, Geldanlage, Immobilienfinanzierung, unabhängig',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Marco Arpa | Unabhängige Finanzberatung',
    description: 'Deine Finanzen. Klar durchdacht. Kostenloses Erstgespräch buchen.',
    url: SITE_URL,
    siteName: 'Marco Arpa',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
