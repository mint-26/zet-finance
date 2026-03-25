import './globals.css';

export const metadata = {
  title: 'Marco Arpa | Unabhängige Finanzberatung',
  description: 'Personalisierte und unabhängige Finanzberatung. Altersvorsorge, Versicherungen, Geldanlage und Immobilienfinanzierung.',
  keywords: 'Finanzberatung, Altersvorsorge, Versicherung, Geldanlage, Immobilienfinanzierung, unabhängig',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Marco Arpa | Unabhängige Finanzberatung',
    description: 'Deine Finanzen. Klar durchdacht. Kostenloses Erstgespräch buchen.',
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
