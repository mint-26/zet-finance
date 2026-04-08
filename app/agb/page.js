'use client';

import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import CookieConsent from '../../components/CookieConsent';

function AGBContent() {
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
        }}>Allgemeine Geschäftsbedingungen</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)' }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>1. Geltungsbereich</h2>
            <p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Dienstleistungen, die Marco Arpa als Versicherungsmakler im Bereich der Zahnzusatzversicherung erbringt. Mit der Nutzung des Fragebogens auf dieser Website erklären Sie sich mit diesen Bedingungen einverstanden.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>2. Leistungsbeschreibung</h2>
            <p>Marco Arpa bietet eine unabhängige Beratung und Vermittlung von Zahnzusatzversicherungen an. Die Beratung umfasst die Analyse Ihres individuellen Bedarfs, die Auswahl passender Tarife aus dem Angebot verschiedener Versicherungsgesellschaften sowie die Unterstützung bei der Antragstellung und laufenden Betreuung Ihres Vertrags.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>3. Maklerverhältnis</h2>
            <p>Mit der Beauftragung zur Vermittlung einer Zahnzusatzversicherung wird ein Maklerverhältnis begründet. Marco Arpa handelt dabei als unabhängiger Versicherungsmakler gemäß §34d GewO und ist nicht an einzelne Versicherungsgesellschaften gebunden. Die Vergütung erfolgt in der Regel durch Courtage seitens der Versicherungsgesellschaften. Für Sie als Kunde entstehen keine zusätzlichen Kosten.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>4. Mitwirkungspflichten</h2>
            <p>Für eine sachgerechte Beratung sind wahrheitsgemäße und vollständige Angaben erforderlich. Dies gilt insbesondere für die im Fragebogen abgefragten Gesundheitsinformationen. Unrichtige Angaben können dazu führen, dass der Versicherungsschutz gefährdet wird.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>5. Haftung</h2>
            <p>Marco Arpa haftet für Schäden nur bei Vorsatz oder grober Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist auf die Verletzung wesentlicher Vertragspflichten beschränkt. Eine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der auf dieser Website bereitgestellten Informationen wird nicht übernommen.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>6. Widerrufsrecht</h2>
            <p>Sie haben das Recht, den Maklervertrag innerhalb von 14 Tagen ohne Angabe von Gründen zu widerrufen. Der Widerruf kann formlos per E-Mail an marco.arpa@outlook.de erfolgen. Im Falle eines Widerrufs werden Ihre personenbezogenen Daten umgehend gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>7. Schlussbestimmungen</h2>
            <p>Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.</p>
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
