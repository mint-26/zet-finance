import './globals.css';
import { SITE_URL } from '../lib/site';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Marco Arpa | Ihr persönlicher Versicherungsmakler',
  description: 'Persönlich beraten. Langfristig begleitet. Marco Arpa, Versicherungsmakler nach § 34d GewO für Privatkunden und Unternehmen, Beratung deutschlandweit.',
  icons: {
    icon: '/favicon.svg?v=2',
  },
  openGraph: {
    title: 'Marco Arpa | Ihr persönlicher Versicherungsmakler',
    description: 'Klarheit für Ihre Absicherung. Persönlich beraten. Langfristig begleitet.',
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
