'use client';

import { useInView } from './useInView';

export default function About() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="about" ref={ref} style={{
      padding: '100px 24px',
      background: 'var(--bg-secondary)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.5s ease',
    }}>
      {/* Subtle accent glow */}
      <div style={{
        position: 'absolute', top: '20%', right: '-10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'var(--accent-dim)',
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 60,
        alignItems: 'center',
        position: 'relative', zIndex: 2,
      }}>
        {/* Photo */}
        <div style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            position: 'relative',
            maxWidth: 420,
            margin: '0 auto',
          }}>
            {/* Decorative frame */}
            <div style={{
              position: 'absolute',
              top: -12, left: -12, right: 12, bottom: 12,
              border: '2px solid var(--border)',
              borderRadius: 20,
              transition: 'border-color 0.3s',
            }} />
            <div style={{
              position: 'absolute',
              top: 12, left: 12, right: -12, bottom: -12,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              borderRadius: 20,
              opacity: 0.15,
            }} />
            <img
              src="/marco.jpg"
              alt="Marco - Unabhängiger Finanzberater"
              style={{
                width: '100%',
                borderRadius: 20,
                position: 'relative',
                zIndex: 2,
                display: 'block',
                filter: 'contrast(1.02)',
              }}
            />
            {/* Experience badge */}
            <div style={{
              position: 'absolute',
              bottom: 20, right: -16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              borderRadius: 14,
              padding: '16px 22px',
              zIndex: 3,
              boxShadow: '0 8px 30px var(--shadow-accent)',
            }}>
              <div style={{
                fontSize: 24, fontWeight: 800,
                color: 'var(--bg-primary)',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1,
              }}>7+</div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: 'var(--bg-primary)',
                opacity: 0.8,
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 2,
              }}>Jahre Erfahrung</div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(30px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Über mich
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, marginBottom: 24, lineHeight: 1.2,
            transition: 'color 0.5s ease',
          }}>
            Hallo, ich bin Marco.
          </h2>

          <div style={{
            fontSize: 16, color: 'var(--text-muted)',
            lineHeight: 1.8,
            display: 'flex', flexDirection: 'column', gap: 16,
            transition: 'color 0.5s ease',
          }}>
            <p>
              Seit über 7 Jahren begleite ich Menschen auf dem Weg zu finanzieller Sicherheit.
              Mein Ansatz ist einfach: Ich höre zu, verstehe deine Situation und entwickle
              einen Plan, der wirklich zu dir passt.
            </p>
            <p>
              Kein Fachjargon, keine versteckten Provisionen, keine Verkaufsgespräche.
              Stattdessen bekommst du ehrliche Beratung von jemandem, der sein Handwerk
              versteht und dein Interesse in den Mittelpunkt stellt.
            </p>
            <p>
              Ob Zahnersatz, Prophylaxe oder Kieferorthopädie: Ich finde die Versicherung, die genau das abdeckt, was Sie brauchen. Nicht mehr, nicht weniger.
            </p>
          </div>

          {/* Credential tags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28,
          }}>
            {[
              'Unabhängiger Makler',
              'Spezialisiert auf Zahnzusatz',
              'Kostenlose Beratung',
              'DSGVO-konform',
            ].map((tag, i) => (
              <span key={i} style={{
                padding: '8px 16px',
                background: 'var(--accent-dim)',
                border: '1px solid var(--border)',
                borderRadius: 100,
                fontSize: 13, fontWeight: 500,
                color: 'var(--accent)',
                transition: 'all 0.3s',
              }}>{tag}</span>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              marginTop: 32,
              padding: '14px 32px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              border: 'none', borderRadius: 10,
              color: 'var(--bg-primary)',
              fontWeight: 700, fontSize: 15,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 24px var(--shadow-accent)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}
          >
            Jetzt kennenlernen →
          </button>
        </div>
      </div>
    </section>
  );
}
