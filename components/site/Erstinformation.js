'use client';

import SiteShell from './SiteShell';
import { C, SERIF, SANS, CONTACT } from '../../lib/brand';

// DRAFT: assembled from the Impressum. Every block marked with <Check>
// still needs to be confirmed by Marco or a legal expert before launch.
function Check({ children }) {
  return (
    <span style={{
      display: 'inline-block', marginLeft: 8, padding: '2px 8px',
      background: '#E6DDC7', color: C.champagneDark, fontFamily: SANS,
      fontSize: 11, letterSpacing: '0.06em', verticalAlign: 'middle',
    }}>
      {children || 'zu prüfen'}
    </span>
  );
}

function Block({ title, check, children }) {
  return (
    <section style={{ borderTop: `1px solid ${C.lineLight}`, padding: '28px 0' }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, margin: '0 0 14px', color: C.black }}>
        {title}{check && <Check />}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: C.graphite }}>{children}</div>
    </section>
  );
}

const link = { color: C.black, textDecorationColor: C.champagne, textUnderlineOffset: 3 };

export default function Erstinformation() {
  return (
    <SiteShell base="/">
      <div style={{ background: C.ivory, color: C.black }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5vw, 56px)' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.champagneDark, margin: 0 }}>
            Vermittlerinformation
          </p>
          <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(36px, 5vw, 52px)', lineHeight: 1.1, margin: '20px 0 16px' }}>
            Erstinformation
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.graphite, margin: '0 0 32px' }}>
            Statusinformationen nach § 15 der Versicherungsvermittlungsverordnung (VersVermV).
          </p>

          <div role="note" style={{
            border: `1px solid ${C.champagneDark}`, padding: '18px 20px', margin: '0 0 40px',
            fontSize: 14, lineHeight: 1.6, color: C.black, background: '#ECE6D8',
          }}>
            <strong style={{ fontWeight: 700 }}>Entwurf, fachliche Prüfung ausstehend.</strong> Zusammengestellt aus den Angaben im Impressum.
            Vor der Veröffentlichung zu prüfen: zuständige Erlaubnisbehörde, Angaben zu Beteiligungen,
            Grundlage der Beratung, Vergütung und Schlichtungsstellen.
          </div>

          <Block title="Angaben zur Person">
            <p>Marco Arpa<br />Versicherungsmakler<br />Königsteiner Straße 6a<br />65812 Bad Soden am Taunus</p>
            <p style={{ marginTop: 12 }}>
              Telefon: <a href={CONTACT.phoneHref} style={link}>{CONTACT.phone}</a><br />
              E-Mail: <a href={`mailto:${CONTACT.email}`} style={link}>{CONTACT.email}</a>
            </p>
          </Block>

          <Block title="Status und Erlaubnis" check>
            <p>
              Ich bin als Versicherungsmakler mit einer Erlaubnis nach § 34d Abs. 1 der Gewerbeordnung (GewO) tätig.
            </p>
            <p style={{ marginTop: 12 }}>
              Erlaubnisbehörde laut Impressum:<br />
              IHK Frankfurt am Main, Börsenplatz 4, 60313 Frankfurt am Main
            </p>
          </Block>

          <Block title="Eintrag im Vermittlerregister">
            <p>
              Registernummer: D-4GG1-I1LV5-50<br />
              Registerstelle: Deutscher Industrie- und Handelskammertag (DIHK) e. V., Breite Straße 29, 10178 Berlin<br />
              Abrufbar unter: <a href="https://www.vermittlerregister.info" target="_blank" rel="noopener noreferrer" style={link}>www.vermittlerregister.info</a>
            </p>
          </Block>

          <Block title="Beteiligungen" check>
            <p>
              Ich halte keine direkte oder indirekte Beteiligung von mehr als 10 % an den Stimmrechten oder am Kapital
              eines Versicherungsunternehmens. Kein Versicherungsunternehmen und kein Mutterunternehmen eines
              Versicherungsunternehmens hält eine direkte oder indirekte Beteiligung von mehr als 10 % an den
              Stimmrechten oder am Kapital meines Unternehmens.
            </p>
          </Block>

          <Block title="Grundlage meiner Beratung" check>
            <p>
              Als Versicherungsmakler stütze ich meinen Rat auf eine hinreichende Zahl von auf dem Markt angebotenen
              Versicherungsverträgen und Versicherern (§ 60 Abs. 1 Versicherungsvertragsgesetz).
            </p>
            <p style={{ marginTop: 12 }}>
              Die Vermittlung von Versicherungsverträgen erfolgt über die Fondsfinanz Maklerservice GmbH,
              Riesstraße 25, 80992 München.
            </p>
          </Block>

          <Block title="Vergütung" check>
            <p>
              Für die Vermittlung eines Versicherungsvertrags erhalte ich in der Regel eine Vergütung vom Versicherer
              (Courtage). Sie ist in der Versicherungsprämie enthalten. Wird im Einzelfall eine andere Vergütung
              vereinbart, informiere ich Sie vorab.
            </p>
          </Block>

          <Block title="Beschwerden und Schlichtungsstellen" check>
            <p>
              Beschwerden können Sie jederzeit an mich richten: <a href={`mailto:${CONTACT.email}`} style={link}>{CONTACT.email}</a>.
              Für die außergerichtliche Streitbeilegung können Sie sich an folgende Schlichtungsstellen wenden:
            </p>
            <p style={{ marginTop: 12 }}>
              Versicherungsombudsmann e. V.<br />Postfach 08 06 32, 10006 Berlin<br />
              <a href="https://www.versicherungsombudsmann.de" target="_blank" rel="noopener noreferrer" style={link}>www.versicherungsombudsmann.de</a>
            </p>
            <p style={{ marginTop: 12 }}>
              Ombudsmann Private Kranken- und Pflegeversicherung<br />Postfach 06 02 22, 10052 Berlin<br />
              <a href="https://www.pkv-ombudsmann.de" target="_blank" rel="noopener noreferrer" style={link}>www.pkv-ombudsmann.de</a>
            </p>
          </Block>

          <Block title="Berufshaftpflichtversicherung">
            <p>R+V Versicherung AG, Raiffeisenplatz 1, 65189 Wiesbaden<br />Räumlicher Geltungsbereich: Deutschland und EU</p>
          </Block>
        </div>
      </div>
    </SiteShell>
  );
}
