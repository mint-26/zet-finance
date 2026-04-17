'use client';

import { useInView } from './useInView';

const TESTIMONIALS = [
  {
    name: 'Julia S.',
    role: 'Kundin seit 2023',
    text: 'Mein Zahnarzt hat mir Marcos Karte gegeben, als eine größere Behandlung anstand. Innerhalb von zwei Tagen hatte ich ein Angebot, das richtig gut gepasst hat. Was mich überrascht hat: Er hat sich auch danach noch gemeldet, um zu fragen ob alles geklappt hat.',
    rating: 5,
  },
  {
    name: 'Michael B.',
    role: 'Kunde seit 2024',
    text: 'Ich hab mich ewig vor dem Thema Versicherung gedrückt. Marco hat das in einem kurzen Telefonat geklärt, ohne Druck, ohne Fachchinesisch. Jetzt zahle ich einen fairen Beitrag und muss mir beim Zahnarzt keine Gedanken mehr über die Kosten machen.',
    rating: 5,
  },
  {
    name: 'Sabine W.',
    role: 'Kundin seit 2022',
    text: 'Letztes Jahr hat Marco von sich aus meinen Tarif überprüft und mir einen besseren vorgeschlagen. Weniger Beitrag, bessere Leistung. Das macht kein normaler Versicherungsvertreter. Kann ich wirklich empfehlen.',
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
