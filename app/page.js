import HomePage from '../components/site/HomePage';
import ZahnzusatzPage from './zahnzusatz/ZahnzusatzPage';

// Fallback switch: set the Vercel env var STARTSEITE=zahnzusatz and redeploy
// to show the dental lead page on marcoarpa.com again (as before the relaunch).
// Without it the new broker start page is shown. /zahnzusatz works either way.
const ZAHNZUSATZ_ALS_STARTSEITE = process.env.STARTSEITE === 'zahnzusatz';

export const metadata = ZAHNZUSATZ_ALS_STARTSEITE
  ? {
      title: 'Marco Arpa | Unabhängige Finanzberatung',
      description: 'Personalisierte und unabhängige Finanzberatung. Altersvorsorge, Versicherungen, Geldanlage und Immobilienfinanzierung.',
      alternates: { canonical: '/' },
      openGraph: {
        title: 'Marco Arpa | Unabhängige Finanzberatung',
        description: 'Deine Finanzen. Klar durchdacht. Kostenloses Erstgespräch buchen.',
      },
    }
  : {
      alternates: { canonical: '/' },
    };

export default function Page() {
  return ZAHNZUSATZ_ALS_STARTSEITE ? <ZahnzusatzPage /> : <HomePage />;
}
