'use client';

import { ThemeProvider, useTheme } from '../../components/ThemeProvider';

function DatenschutzContent() {
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
            }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
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
        }}>Datenschutzerklärung</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)' }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>1. Verantwortlicher</h2>
            <p>Marco Arpa<br />Versicherungsmakler nach §34d GewO<br />Frankfurt am Main<br />E-Mail: marco.arpa@outlook.de<br />Telefon: +49 152 5461 1314</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>Beim Besuch dieser Website werden automatisch Informationen durch den Hosting-Anbieter (Vercel Inc.) erfasst. Diese Informationen umfassen den Browsertyp, das Betriebssystem, die abgerufene Seite, Datum und Uhrzeit des Zugriffs sowie die IP-Adresse. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>3. Kontaktformular / Fragebogen</h2>
            <p>Wenn Sie den Fragebogen auf dieser Website ausfüllen, werden die von Ihnen eingegebenen Daten (Anrede, Name, Geburtsdatum, E-Mail-Adresse, Angaben zum Zahnzustand) per E-Mail an uns übermittelt. Die Übermittlung erfolgt über den Dienst FormSubmit. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage und zur Erstellung eines individuellen Angebots verwendet.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>4. Weitergabe von Daten</h2>
            <p>Eine Übermittlung Ihrer Daten an Dritte findet nur statt, wenn dies zur Vertragsdurchführung erforderlich ist (z.&nbsp;B. an kooperierende Versicherungsgesellschaften zur Angebotserstellung) oder Sie ausdrücklich eingewilligt haben. Eine darüber hinausgehende Weitergabe erfolgt nicht.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>5. Ihre Rechte</h2>
            <p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung. Darüber hinaus haben Sie das Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>6. Speicherdauer</h2>
            <p>Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt. Für Vertragsdaten gilt die gesetzliche Aufbewahrungsfrist von bis zu 10 Jahren gemäß HGB und AO.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>7. Hosting</h2>
            <p>Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Die Server befinden sich teilweise in den USA. Die Datenübertragung in die USA wird auf Grundlage der Standardvertragsklauseln der EU-Kommission durchgeführt.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>8. Cookies</h2>
            <p>Diese Website verwendet keine Tracking-Cookies und keine Analyse-Tools. Es wird lediglich ein technisch notwendiges Cookie zur Speicherung Ihrer Theme-Präferenz (Hell-/Dunkelmodus) gesetzt.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function Datenschutz() {
  return (
    <ThemeProvider>
      <DatenschutzContent />
    </ThemeProvider>
  );
}
