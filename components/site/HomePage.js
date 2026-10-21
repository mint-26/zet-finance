'use client';

import { useState } from 'react';
import SiteShell from './SiteShell';
import { Arrow, Plus } from './Icons';
import { C, SERIF, SANS, CONTACT } from '../../lib/brand';

const WRAP = { maxWidth: 1120, margin: '0 auto', padding: '0 clamp(20px, 5vw, 56px)' };

const eyebrow = (color) => ({
  fontFamily: SANS, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
  color, margin: 0,
});

// Only services Marco has confirmed (handout, sections 03 to 05).
const AREAS = [
  {
    key: 'privat',
    title: 'Privat.',
    sub: 'Für Ihr Leben und das, was Ihnen wichtig ist.',
    intro: 'Ich betrachte zuerst Ihre Situation und Ihre Ziele. Erst danach ordne ich ein, welche Absicherung zu Ihnen passt.',
    items: [
      'Private Krankenversicherung: Neuabschluss und Wechsel',
      'Biometrische Absicherung, etwa bei Berufsunfähigkeit',
      'Energievergleich für Strom und Gas',
    ],
  },
  {
    key: 'unternehmen',
    title: 'Unternehmen.',
    sub: 'Für Ihren Betrieb und Ihre Verantwortung.',
    intro: 'Für betriebliche Themen arbeite ich mit einem Netzwerk aus Spezialisten zusammen. Ihr Ansprechpartner bleibe ich.',
    items: [
      'Betriebliche Krankenversicherung, gemeinsam mit einem Spezialisten',
      'Größere betriebliche Themen über mein Spezialistennetzwerk',
    ],
  },
];

const STEPS = [
  { title: 'Kennenlernen', text: 'Wir sprechen über Ihre Situation und Ihr Anliegen.' },
  { title: 'Gesamtanalyse', text: 'Ich sehe mir Ihre bestehenden Verträge und Ihren Bedarf an.' },
  { title: 'Empfehlung', text: 'Sie erhalten eine verständliche Empfehlung, die zu Ihnen passt.' },
  { title: 'Umsetzung', text: 'Ich kümmere mich um Antrag und Abschluss.' },
  { title: 'Betreuung', text: 'Ich bleibe auch nach dem Abschluss Ihr Ansprechpartner.' },
];

function TextLink({ href, children, color = C.black }) {
  return (
    <a href={href} className="site-link" style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 44,
      color, textDecoration: 'none', fontSize: 14,
      borderBottom: `1px solid ${C.champagne}`,
    }}>
      {children} <Arrow size={11} />
    </a>
  );
}

function Area({ area, open, onToggle }) {
  const panelId = `bereich-${area.key}`;
  return (
    <div id={area.key} style={{ borderTop: `1px solid ${C.lineLight}`, scrollMarginTop: 100 }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}
          className="area-toggle"
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16,
            padding: '24px 0 28px', textAlign: 'left', color: C.black,
          }}
        >
          <span>
            <span style={{
              display: 'block', fontFamily: SERIF, fontWeight: 400,
              fontSize: 'clamp(36px, 4.4vw, 50px)', lineHeight: 1.1, letterSpacing: '-0.01em',
            }}>{area.title}</span>
            <span style={{ display: 'block', marginTop: 12, fontFamily: SANS, fontSize: 14, color: C.graphite }}>{area.sub}</span>
          </span>
          <span style={{ color: C.champagneDark, paddingTop: 18 }}><Plus open={open} size={18} /></span>
        </button>
      </h3>
      <div id={panelId} hidden={!open} style={{ paddingBottom: 32 }}>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: C.graphite, margin: '0 0 20px', maxWidth: 460 }}>{area.intro}</p>
        <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0 }}>
          {area.items.map((item) => (
            <li key={item} style={{
              borderTop: `1px solid ${C.lineLight}`, padding: '13px 0',
              fontSize: 15, lineHeight: 1.5, color: C.black,
            }}>{item}</li>
          ))}
        </ul>
        <TextLink href="#kontakt">Lassen Sie uns sprechen</TextLink>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [openArea, setOpenArea] = useState(null);
  const [stepsOpen, setStepsOpen] = useState(false);

  // Menu links "Privatkunden" / "Unternehmen" open the matching area.
  const onNavigate = (hash) => {
    if (hash === 'privat' || hash === 'unternehmen') setOpenArea(hash);
  };

  return (
    <SiteShell onNavigate={onNavigate}>
      {/* Einstieg */}
      <section id="top" aria-labelledby="hero-title" style={{ background: C.black }}>
        <div style={{ ...WRAP, paddingTop: 'clamp(56px, 9vw, 112px)', paddingBottom: 'clamp(28px, 4vw, 40px)' }}>
          <div className="hero-grid">
            <div>
              <p style={eyebrow(C.champagne)}>Ihr persönlicher Versicherungsmakler</p>
              <h1 id="hero-title" style={{
                fontFamily: SERIF, fontWeight: 400, color: C.ivory,
                fontSize: 'clamp(42px, 6.4vw, 80px)', lineHeight: 1.04,
                letterSpacing: '-0.015em', margin: '28px 0 0',
              }}>
                Klarheit für<br />Ihre <em style={{ fontStyle: 'italic' }}>Absicherung</em>.
              </h1>
              <p style={{ fontSize: 15, color: C.grey, margin: '26px 0 0' }}>Persönlich beraten. Langfristig begleitet.</p>
              <a href="#kontakt" className="hero-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: 28, marginTop: 36,
                minHeight: 52, padding: '0 22px', background: C.ivory, color: C.black,
                textDecoration: 'none', fontSize: 14,
              }}>
                Lassen Sie uns sprechen <Arrow size={11} />
              </a>
            </div>
            <img src="/wappen-white.svg?v=1" alt="Wappen von Marco Arpa" className="hero-crest" width="607" height="549" />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
            marginTop: 'clamp(48px, 8vw, 104px)', fontSize: 12, color: C.grey,
          }}>
            <span>Privatkunden &amp; Unternehmen</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              <span aria-hidden="true" style={{ width: 40, height: 1, background: C.champagne }} />
              Deutschlandweit
            </span>
          </div>
        </div>
      </section>

      {/* Privat und Unternehmen */}
      <section id="absichern" aria-labelledby="absichern-title" style={{ background: C.ivory, color: C.black }}>
        <div style={{ ...WRAP, paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
          <h2 id="absichern-title" style={{ ...eyebrow(C.champagneDark), fontWeight: 400, marginBottom: 28 }}>Was möchten Sie absichern?</h2>
          <div className="areas-grid">
            {AREAS.map((a) => (
              <Area
                key={a.key} area={a} open={openArea === a.key}
                onToggle={() => setOpenArea((v) => (v === a.key ? null : a.key))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Person und Betreuung */}
      <section id="ueber-marco" aria-labelledby="person-title" style={{ background: C.black, scrollMarginTop: 76 }}>
        <div className="person-grid" style={{ ...WRAP, paddingTop: 'clamp(64px, 8vw, 104px)', paddingBottom: 'clamp(64px, 8vw, 104px)' }}>
          <div>
            <p style={eyebrow(C.champagne)}>Marco Arpa</p>
            <h2 id="person-title" style={{
              fontFamily: SERIF, fontWeight: 400, color: C.ivory,
              fontSize: 'clamp(34px, 4.2vw, 48px)', lineHeight: 1.12, margin: '24px 0 0',
            }}>
              Ein Ansprechpartner.<br />Auch danach.
            </h2>
            <p style={{ fontFamily: SERIF, fontSize: 18, color: C.champagne, margin: '28px 0 0' }}>Marco Arpa</p>
          </div>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.grey, margin: '0 0 28px', maxWidth: 420 }}>
              Ich ordne Ihre Versicherungen verständlich und bleibe auch nach dem Abschluss an Ihrer Seite.
            </p>
            <div style={{ borderTop: `1px solid ${C.lineDark}`, borderBottom: `1px solid ${C.lineDark}` }}>
              <button
                type="button" aria-expanded={stepsOpen} aria-controls="so-arbeite-ich"
                onClick={() => setStepsOpen((v) => !v)}
                style={{
                  width: '100%', minHeight: 56, background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  color: C.ivory, fontFamily: SANS, fontSize: 14, padding: 0,
                }}
              >
                So arbeite ich
                <span style={{ color: C.champagne }}><Plus open={stepsOpen} /></span>
              </button>
              <ol id="so-arbeite-ich" hidden={!stepsOpen} style={{ listStyle: 'none', margin: 0, padding: '0 0 12px' }}>
                {STEPS.map((s, i) => (
                  <li key={s.title} style={{ display: 'flex', gap: 18, padding: '14px 0', borderTop: `1px solid ${C.lineDark}` }}>
                    <span style={{ fontFamily: SERIF, fontSize: 14, color: C.champagne, minWidth: 18 }}>{i + 1}</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 14, color: C.ivory }}>{s.title}</span>
                      <span style={{ display: 'block', fontSize: 14, lineHeight: 1.6, color: C.grey, marginTop: 4 }}>{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" aria-labelledby="kontakt-title" style={{ background: C.black, borderTop: `1px solid ${C.lineDark}` }}>
        <div className="contact-grid" style={{ ...WRAP, paddingTop: 'clamp(56px, 7vw, 80px)', paddingBottom: 'clamp(56px, 7vw, 80px)' }}>
          <h2 id="kontakt-title" style={{
            fontFamily: SERIF, fontWeight: 400, color: C.ivory, margin: 0,
            fontSize: 'clamp(28px, 3.2vw, 38px)', lineHeight: 1.2,
          }}>
            Ihr Anliegen beginnt<br />mit einem Gespräch.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <TextLink href={`mailto:${CONTACT.email}`} color={C.ivory}>{CONTACT.email}</TextLink>
            <TextLink href={CONTACT.phoneHref} color={C.ivory}>{CONTACT.phone}</TextLink>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .hero-grid {
          display: grid; grid-template-columns: minmax(0, 1fr) auto;
          align-items: center; gap: 48px;
        }
        .hero-crest { width: clamp(220px, 25vw, 300px); height: auto; display: block; }
        .hero-cta { transition: background 0.2s ease; }
        .hero-cta:hover { background: #ffffff !important; }
        .areas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 clamp(32px, 5vw, 72px); align-items: start; }
        .area-toggle:hover span span:first-child { color: ${C.champagneDark}; }
        .person-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        .contact-grid { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: end; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .hero-crest { width: 160px; justify-self: end; }
          .areas-grid { grid-template-columns: 1fr; }
          .areas-grid > div:last-child { border-bottom: 1px solid ${C.lineLight}; }
          .person-grid { grid-template-columns: 1fr; gap: 40px; }
          .contact-grid { grid-template-columns: 1fr; align-items: start; }
        }
      `}</style>
    </SiteShell>
  );
}
