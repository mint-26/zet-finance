'use client';

import { useInView } from './useInView';

const SERVICES = [
  {
    icon: '🎯',
    title: 'Personalisierte Beratung',
    desc: 'Keine Schablonen. Ich analysiere deine Situation und entwickle eine Strategie, die zu deinem Leben passt.',
  },
  {
    icon: '⚡',
    title: 'Effiziente Lösungen',
    desc: 'Klare Empfehlungen, die deine finanziellen Ziele kosteneffizient und ohne Umwege erreichen.',
  },
  {
    icon: '🤝',
    title: 'Langfristige Partnerschaft',
    desc: 'Keine einmalige Beratung. Ich begleite dich über Jahre und passe die Strategie an dein Leben an.',
  },
  {
    icon: '📊',
    title: 'Transparente Analyse',
    desc: 'Du verstehst jede Entscheidung. Ich erkläre dir genau, warum ich was empfehle.',
  },
];

export default function Services() {
  const [ref, inView] = useInView();

  return (
    <section id="services" ref={ref} style={{
      padding: '100px 24px',
      background: 'var(--bg-primary)',
      position: 'relative',
      transition: 'background 0.5s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 60 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Leistungen
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, lineHeight: 1.2,
            transition: 'color 0.5s ease',
          }}>
            Was ich für dich tue
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="service-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16, padding: 32,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                cursor: 'default',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{
                fontSize: 18, fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 10,
                transition: 'color 0.3s',
              }}>{s.title}</h3>
              <p style={{
                fontSize: 14, color: 'var(--text-muted)',
                lineHeight: 1.7,
                transition: 'color 0.3s',
              }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .service-card:hover {
          border-color: var(--accent) !important;
          transform: translateY(-4px) !important;
        }
      `}</style>
    </section>
  );
}
