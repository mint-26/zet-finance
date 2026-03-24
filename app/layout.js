import './globals.css';

export const metadata = {
  title: 'Marco Finanzen | Unabhängige Finanzberatung',
  description: 'Personalisierte und unabhängige Finanzberatung. Altersvorsorge, Versicherungen, Geldanlage und Immobilienfinanzierung.',
  keywords: 'Finanzberatung, Altersvorsorge, Versicherung, Geldanlage, Immobilienfinanzierung, unabhängig',
  openGraph: {
    title: 'Marco Finanzen | Unabhängige Finanzberatung',
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
