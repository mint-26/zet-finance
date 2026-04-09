'use client';

import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import CookieConsent from '../../components/CookieConsent';

function DatenschutzContent() {
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
        }}>Datenschutzerklärung</h1>

        <div style={hinweisStyle}>
          Hinweis: Diese Datenschutzerklärung ist ein Entwurf und sollte von einem Rechtsanwalt geprüft werden.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
          <section>
            <h2 style={h2Style}><span style={numStyle}>1.</span> Verantwortlicher</h2>
            <p>
              Marco Arpa<br />
              Versicherungsmakler nach §34d GewO<br />
              Alte Dieburger Str. 46<br />
              64367 Mühltal Trautheim<br />
              E-Mail: <a href="mailto:marco.arpa@outlook.de" style={linkStyle}>marco.arpa@outlook.de</a><br />
              Telefon: +49 152 5461 1314
            </p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>2.</span> Erhebung und Speicherung personenbezogener Daten</h2>
            <p>Beim Besuch dieser Website werden automatisch Informationen durch den Hosting-Anbieter (Vercel Inc.) erfasst. Diese Informationen umfassen den Browsertyp, das Betriebssystem, die abgerufene Seite, Datum und Uhrzeit des Zugriffs sowie die IP-Adresse. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
            <p style={{ marginTop: 12 }}>Die Rechtsgrundlage für die Verarbeitung dieser Daten ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse besteht in der Bereitstellung einer funktionsfähigen Website.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>3.</span> Kontaktformular und Fragebogen</h2>
            <p>Wenn Sie den Fragebogen auf dieser Website ausfüllen, werden folgende Daten erhoben:</p>
            <ul style={{ paddingLeft: 24, marginTop: 8, marginBottom: 12 }}>
              <li>Anrede, Vorname, Nachname</li>
              <li>Geburtsdatum</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer (optional)</li>
              <li>Angaben zum Zahnzustand (Gesundheitsdaten)</li>
              <li>Angaben zu bestehenden Versicherungen</li>
              <li>Wünsche zur Versicherungsleistung</li>
              <li>Freitextnachricht (optional)</li>
            </ul>
            <p>Gesundheitsdaten (Angaben zum Zahnzustand) sind besondere Kategorien personenbezogener Daten im Sinne von Art. 9 DSGVO. Die Verarbeitung dieser Daten erfolgt ausschließlich auf Grundlage Ihrer ausdrücklichen Einwilligung gemäß Art. 9 Abs. 2 lit. a DSGVO, die Sie über die Datenschutz-Checkbox im Fragebogen erteilen.</p>
            <p style={{ marginTop: 12 }}>Die übrigen personenbezogenen Daten werden auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) verarbeitet.</p>
            <p style={{ marginTop: 12 }}>Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage und zur Erstellung eines individuellen Versicherungsangebots verwendet.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>4.</span> Weitergabe von Daten</h2>
            <p>Im Rahmen der Angebotserstellung können Ihre Daten an folgende Empfänger weitergegeben werden:</p>
            <ul style={{ paddingLeft: 24, marginTop: 8, marginBottom: 12 }}>
              <li>Fondsfinanz Maklerservice GmbH, Riesstraße 25, 80992 München (Maklerpool zur Vertragsvermittlung)</li>
              <li>Versicherungsgesellschaften, soweit dies zur Erstellung eines Angebots erforderlich ist</li>
            </ul>
            <p>Eine darüber hinausgehende Weitergabe an Dritte erfolgt nicht, es sei denn, wir sind gesetzlich dazu verpflichtet.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>5.</span> Ihre Rechte</h2>
            <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
            <ul style={{ paddingLeft: 24, marginTop: 8, marginBottom: 12 }}>
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Recht auf Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
            <p>Eine erteilte Einwilligung zur Verarbeitung von Gesundheitsdaten können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Senden Sie den Widerruf an: <a href="mailto:marco.arpa@outlook.de" style={linkStyle}>marco.arpa@outlook.de</a></p>
            <p style={{ marginTop: 12 }}>Darüber hinaus haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.</p>
            <p style={{ marginTop: 12 }}>
              Zuständige Aufsichtsbehörde:<br />
              Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
              Postfach 3163<br />
              65021 Wiesbaden<br />
              <a href="https://www.datenschutz.hessen.de" target="_blank" rel="noopener noreferrer" style={linkStyle}>www.datenschutz.hessen.de</a>
            </p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>6.</span> Speicherdauer</h2>
            <p>Personenbezogene Daten werden gelöscht, sobald der Zweck der Speicherung entfällt. Für Daten aus dem Fragebogen gilt: Kommt kein Vertrag zustande, werden Ihre Daten spätestens 6 Monate nach dem letzten Kontakt gelöscht. Für Vertragsdaten gelten die gesetzlichen Aufbewahrungsfristen von bis zu 10 Jahren gemäß HGB und AO.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>7.</span> Hosting</h2>
            <p>Diese Website wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet. Die Datenübertragung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln gemäß Art. 46 Abs. 2 lit. c DSGVO.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>8.</span> Cookies</h2>
            <p>Diese Website verwendet keine Tracking-Cookies und keine Analyse-Tools. Es wird lediglich ein technisch notwendiges Cookie zur Speicherung Ihrer Theme-Präferenz (Hell-/Dunkelmodus) im lokalen Speicher des Browsers gesetzt. Dieses Cookie enthält keine personenbezogenen Daten.</p>
          </section>

          <section>
            <h2 style={h2Style}><span style={numStyle}>9.</span> SSL-/TLS-Verschlüsselung</h2>
            <p>Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von &quot;http://&quot; auf &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
          </section>
        </div>
      </main>
      <CookieConsent />
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
