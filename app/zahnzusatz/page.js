import ZahnzusatzPage from './ZahnzusatzPage';

// Lead landing page, reached via QR codes and direct links only.
// Kept out of search engines on purpose (not linked from the main site).
export const metadata = {
  title: 'Marco Arpa | Unabhängige Finanzberatung',
  description: 'Personalisierte und unabhängige Finanzberatung. Altersvorsorge, Versicherungen, Geldanlage und Immobilienfinanzierung.',
  alternates: {
    canonical: '/zahnzusatz',
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Marco Arpa | Unabhängige Finanzberatung',
    description: 'Deine Finanzen. Klar durchdacht. Kostenloses Erstgespräch buchen.',
    url: '/zahnzusatz',
  },
};

export default function Page() {
  return <ZahnzusatzPage />;
}
