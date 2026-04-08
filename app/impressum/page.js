'use client';

import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import CookieConsent from '../../components/CookieConsent';

function ImpressumContent() {
  const { theme, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-body)', transition: 'background 0.5s ease, color 0.5s ease' }}>
      {/* Header */}
      <nav style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 16, color: 'var(--bg-primary)',
            }}>M</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Marco Arpa</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={toggle} aria-label="Theme wechseln" style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)',
              border: '1px solid var(--border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--accent)',
            }}>{theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}</button>
            <a href="/" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              \u2190 Zur Startseite
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)' }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Angaben gem\u00e4\u00df \u00a7 5 TMG</h2>
            <p>Marco Arpa<br />Versicherungsmakler nach \u00a734d GewO<br />Frankfurt am Main</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Kontakt</h2>
            <p>E-Mail: marco.arpa@outlook.de<br />Telefon: +49 152 5461 1314</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Aufsichtsbeh\u00f6rde</h2>
            <p>Zust\u00e4ndige Aufsichtsbeh\u00f6rde: IHK Frankfurt am Main</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Berufsrechtliche Regelungen</h2>
            <p>\u00a734d Gewerbeordnung (GewO)<br />Verordnung \u00fcber die Versicherungsvermittlung (VersVermV)</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Registrierung</h2>
            <p>Registernummer: <span style={{ color: 'var(--accent)' }}>[Platzhalter \u2013 muss Marco ausf\u00fcllen]</span></p>
            <p>Registerstelle: Deutscher Industrie- und Handelskammertag (DIHK) e.V., Breite Stra\u00dfe 29, 10178 Berlin</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Berufshaftpflichtversicherung</h2>
            <p><span style={{ color: 'var(--accent)' }}>[Platzhalter \u2013 Name und Anschrift des Versicherers sowie r\u00e4umlicher Geltungsbereich m\u00fcssen erg\u00e4nzt werden]</span></p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Streitschlichtung</h2>
            <p>Versicherungsombudsmann e.V.<br />Postfach 08 06 32<br />10006 Berlin<br /><br />
            Die Europ\u00e4ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit.</p>
          </section>
        </div>
      </main>
      <CookieConsent />
    </div>
  );
}

export default function Impressum() {
  return (
    <ThemeProvider>
      <ImpressumContent />
    </ThemeProvider>
  );
}
