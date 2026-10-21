import Erstinformation from '../../components/site/Erstinformation';

export const metadata = {
  title: 'Erstinformation | Marco Arpa',
  description: 'Statusinformationen nach § 15 Versicherungsvermittlungsverordnung: Erlaubnis, Registrierung, Beratungsgrundlage, Vergütung und Schlichtungsstellen.',
  alternates: {
    canonical: '/erstinformation',
  },
};

export default function Page() {
  return <Erstinformation />;
}
