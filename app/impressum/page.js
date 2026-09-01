'use client';

import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import CookieConsent from '../../components/CookieConsent';

function ImpressumContent() {
  const { theme, toggle } = useTheme();

  const h2Style = {
    fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12,
    fontFamily: "'Playfair Display', serif",
  };

  const numStyle = { color: 'var(--accent)', fontWeight: 700 };

  const linkStyle = { color: 'var(--accent)', textDecoration: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-body)', transition: 'background 0.5s ease, color 0.5s ease' }}>
      {/* Header */}
      <nav style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src={theme === 'dark' ? '/logo-white.svg?v=2' : '/logo-black.svg'}
              alt="Marco Arpa"
              style={{ height: 47, width: 'auto' }}
            />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={toggle} aria-label="Theme wechseln" style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)',
              border: '1px solid var(--border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--accent)',
            }}>{theme === 'dark' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}</button>
            <a href="/" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              ← Zur Startseite
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 100px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700, color: 'var(--text-primary)', marginBottom: 40,
        }}>Impressum</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
          <section>
            <h2 style={h2Style}><span style={numStyle}>§</span> Angaben gemäß § 5 TMG</h2>
            <p>Marco Arpa<br />Versicherungsmakler nach §34d GewO<br /><br />Alte Dieburger Str. 46<br />64367 Trautheim</p>
          </section>

          <section>
            <h2 style={h2Style}>Kontakt</h2>
            <p>E-Mail: <a href="mailto:kontakt@marcoarpa.com" style={linkStyle}>kontakt@marcoarpa.com</a><br />Telefon: +49 152 5461 1314</p>
          </section>

          <section>
            <h2 style={h2Style}>Registrierung</h2>
            <p>
              Registriert als Versicherungsmakler nach §34d Abs. 1 GewO<br />
              Registernummer: D-4GG1-I1LV5-50<br />
              Registerstelle: Deutscher Industrie- und Handelskammertag (DIHK) e.V., Breite Straße 29, 10178 Berlin<br />
              Überprüfbar unter: <a href="https://www.vermittlerregister.info" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.vermittlerregister.info</a>
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Zuständige Aufsichtsbehörde</h2>
            <p>
              IHK Frankfurt am Main<br />
              Börsenplatz 4<br />
              60313 Frankfurt am Main<br />
              <a href="https://www.frankfurt-main.ihk.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.frankfurt-main.ihk.de</a>
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Berufsrechtliche Regelungen</h2>
            <p>
              §34d Gewerbeordnung (GewO)<br />
              Versicherungsvermittlungsverordnung (VersVermV)<br />
              Einsehbar unter: <a href="https://www.gesetze-im-internet.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.gesetze-im-internet.de</a>
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Berufshaftpflichtversicherung</h2>
            <p>
              R+V Versicherung AG<br />
              Raiffeisenplatz 1<br />
              65189 Wiesbaden<br />
              Räumlicher Geltungsbereich: Deutschland und EU
            </p>
          </section>

          <section>
            <h2 style={h2Style}>Vermittlerpool</h2>
            <p>Die Vermittlung von Versicherungsverträgen erfolgt über den Fondsfinanz Maklerservice GmbH, Riesstraße 25, 80992 München.</p>
          </section>

          <section>
            <h2 style={h2Style}>Streitschlichtung</h2>
            <p>
              Versicherungsombudsmann e.V.<br />
              Postfach 08 06 32<br />
              10006 Berlin<br />
              <a href="https://www.versicherungsombudsmann.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.versicherungsombudsmann.de</a>
            </p>
            <p style={{ marginTop: 16 }}>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={linkStyle}>https://ec.europa.eu/consumers/odr</a><br />
              E-Mail: <a href="mailto:kontakt@marcoarpa.com" style={linkStyle}>kontakt@marcoarpa.com</a>
            </p>
            <p style={{ marginTop: 16 }}>Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </section>

          <section>
            <h2 style={h2Style}>Haftung für Inhalte</h2>
            <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
          </section>

          <section>
            <h2 style={h2Style}>Haftung für Links</h2>
            <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.</p>
          </section>
        </div>
      </main>
      <CookieConsent />
    </div>
  );
}

export default function Impressum() {
  return (
    <ThemeProvider autoSchedule>
      <ImpressumContent />
    </ThemeProvider>
  );
}
