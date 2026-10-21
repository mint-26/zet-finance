import Erstinformation from '../../components/site/Erstinformation';

export const metadata = {
  title: 'Erstinformation | Marco Arpa',
  description: 'Statusinformationen nach § 15 Versicherungsvermittlungsverordnung: Erlaubnis, Registrierung, Beratungsgrundlage, Vergütung und Schlichtungsstellen.',
  alternates: {
    canonical: '/erstinformation',
  },
  // Draft until reviewed: keep out of search engines, remove after approval.
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <Erstinformation />;
}
