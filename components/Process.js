'use client';

import { useInView } from './useInView';

const STEPS = [
  { num: '01', title: 'Kurzes Gespräch', desc: '5 Minuten reichen. Wir klären Ihre Zahnsituation und was Ihnen wichtig ist. Telefonisch, per WhatsApp oder vor Ort.' },
  { num: '02', title: 'Fragebogen ausfüllen', desc: 'Ein paar Fragen zu Ihren Zähnen und Ihrer Gesundheit direkt hier auf der Website. Dauert 2 Minuten.' },
  { num: '03', title: 'Ihr persönliches Angebot', desc: 'Ich vergleiche den gesamten Markt und finde den Tarif, der zu Ihren Zähnen und Ihrem Budget passt. Keine Standardlösung.' },
  { num: '04', title: 'Rechnung einreichen, fertig', desc: 'Sie reichen Ihre Zahnarztrechnung ein. Den Rest erledige ich. Kommunikation mit der Versicherung, Nachfragen, Abwicklung. Und wenn mal was ist: Ich bin 24/7, 365 Tage im Jahr für Sie erreichbar.' },
];

export default function Process() {
  const [ref, inView] = useInView();

  return (
    <section id="process" ref={ref} style={{
      padding: '100px 24px',
      background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
      transition: 'background 0.5s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 60 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Prozess
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, lineHeight: 1.2,
          }}>
            So läuft&apos;s ab
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              position: 'relative', padding: '32px 28px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
            }}>
              <div style={{
                fontSize: 48, fontWeight: 800,
                color: 'var(--step-num)',
                marginBottom: 16, lineHeight: 1,
                transition: 'all 0.3s',
              }}>{step.num}</div>
              <h3 style={{
                fontSize: 18, fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}>{step.title}</h3>
              <p style={{
                fontSize: 14, color: 'var(--text-muted)',
                lineHeight: 1.7,
              }}>{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="step-arrow" style={{
                  position: 'absolute', right: -12, top: '50%',
                  color: 'var(--border)', fontSize: 20,
                }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .step-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}
