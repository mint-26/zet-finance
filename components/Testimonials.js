'use client';

import { useInView } from './useInView';

const TESTIMONIALS = [
  {
    name: 'Thomas K.',
    role: 'Unternehmer',
    text: 'Marco hat mir geholfen, meine Altersvorsorge komplett neu aufzustellen. Endlich verstehe ich, wo mein Geld hingeht.',
    rating: 5,
  },
  {
    name: 'Sarah M.',
    role: 'Ärztin',
    text: 'Professionell, ehrlich und immer erreichbar. Die beste Entscheidung, die ich für meine Finanzen getroffen habe.',
    rating: 5,
  },
  {
    name: 'David R.',
    role: 'Ingenieur',
    text: 'Kein Verkaufsgespräch, sondern echte Beratung. Marco nimmt sich Zeit und denkt mit.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [ref, inView] = useInView();

  return (
    <section id="testimonials" ref={ref} style={{
      padding: '100px 24px',
      background: 'var(--bg-secondary)',
      transition: 'background 0.5s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 60 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Kundenstimmen
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, lineHeight: 1.2,
          }}>
            Was Kunden sagen
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16, padding: 32,
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
            }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} style={{ color: 'var(--accent)', fontSize: 16 }}>★</span>
                ))}
              </div>
              <p style={{
                fontSize: 15, color: 'var(--text-body)',
                lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic',
              }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, color: 'var(--bg-primary)',
                }}>{t.name[0]}</div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
                  }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
