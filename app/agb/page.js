'use client';

import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import CookieConsent from '../../components/CookieConsent';

function AGBContent() {
  const { theme, toggle } = useTheme();

  const h2Style = {
    fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12,
    fontFamily: "'Playfair Display', serif",
  };

  const numStyle = { color: 'var(--accent)', fontWeight: 700 };

  const linkStyle = { color: 'var(--accent)', textDecoration: 'none' };

  const hinweisStyle = {
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--text-primary)',
    fontWeight: 500,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-body)', transition: 'background 0.5s ease, color 0.5s ease' }}>
      {/* Header */}
      <nav style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src={theme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
              alt="Marco Arpa"
              style={{ height: 36, width: 'auto' }}
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
        }}>Nutzungsbedingungen</h1>

        <div style={hinweisStyle}>
          Hinweis: Diese Nutzungsbedingungen sind ein Entwurf und sollten von einem Rechtsanwalt geprüft werden.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
          <section>
            <h2 style={h2Style}><span style={numStyle}>1.</span> Geltungsbereich</h2>
            <p>Diese Nutzungsbedingungen gelten für die Nutzung der Website von Marco Arpa, Alte Dieburger Str. 46, 64367 Mühltal Trautheim. Die Website dient ausschließlich der Erfassung von Kontakt- und Bedarfsdaten zur Erstellung eines unverbindlichen Angebots für Zahnzusatzversicherungen.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>2.</span> Anbieter</h2>
            <p>
              Marco Arpa<br />
              Versicherungsmakler nach §34d GewO<br />
              Alte Dieburger Str. 46<br />
              64367 Mühltal Trautheim<br />
              E-Mail: <a href="mailto:marco.arpa@outlook.de" style={linkStyle}>marco.arpa@outlook.de</a><br />
              Telefon: +49 152 5461 1314<br />
              Registernummer: D-4GG1-I1LV5-50
            </p>
            <p style={{ marginTop: 12 }}>Die Vermittlung von Versicherungsverträgen erfolgt über den Fondsfinanz Maklerservice GmbH, Riesstraße 25, 80992 München.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>3.</span> Leistungsbeschreibung</h2>
            <p>Über den Fragebogen auf dieser Website können Sie Ihre Kontaktdaten und Angaben zu Ihrer Zahnsituation übermitteln. Auf Basis dieser Angaben erstellt Marco Arpa ein unverbindliches Angebot für eine Zahnzusatzversicherung. Die Vermittlung und der Vertragsabschluss erfolgen ausschließlich über den Fondsfinanz Maklerservice per separatem Antrag. Über diese Website wird kein Versicherungsvertrag und kein Maklervertrag geschlossen.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>4.</span> Unverbindlichkeit</h2>
            <p>Die über diese Website erstellten Angebote sind unverbindlich. Ein Versicherungsvertrag kommt erst durch die Annahme eines separaten Antrags durch die jeweilige Versicherungsgesellschaft zustande.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>5.</span> Kosten</h2>
            <p>Die Nutzung dieser Website und die Beratung durch Marco Arpa sind für Sie kostenlos. Die Vergütung erfolgt durch Courtage der Versicherungsgesellschaften über den Fondsfinanz Maklerservice.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>6.</span> Angaben im Fragebogen</h2>
            <p>Für eine sachgerechte Angebotserstellung sind wahrheitsgemäße und vollständige Angaben erforderlich. Dies gilt insbesondere für die Angaben zu Ihrem Zahnzustand. Die Angaben im Fragebogen stellen keine vorvertraglichen Anzeigen im Sinne des VVG dar. Die vorvertragliche Anzeigepflicht entsteht erst im Rahmen der formellen Antragstellung über den Fondsfinanz Maklerservice.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>7.</span> Datenschutz</h2>
            <p>Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer <a href="/datenschutz" style={linkStyle}>Datenschutzerklärung</a>.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>8.</span> Haftung</h2>
            <p>Marco Arpa übernimmt keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der auf dieser Website bereitgestellten allgemeinen Informationen. Die Haftung für Schäden, die aus der Nutzung dieser Website entstehen, ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Die Haftung im Rahmen der Versicherungsvermittlung richtet sich nach den gesetzlichen Vorschriften und ist durch die Berufshaftpflichtversicherung bei der R+V Versicherung AG abgedeckt.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>9.</span> Schlussbestimmungen</h2>
            <p>Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.</p>
            <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-dim)' }}>Stand: April 2026</p>
          </section>
        </div>
      </main>
      <CookieConsent />
    </div>
  );
}

export default function AGB() {
  return (
    <ThemeProvider>
      <AGBContent />
    </ThemeProvider>
  );
}
