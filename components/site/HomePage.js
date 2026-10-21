'use client';

import SiteShell from './SiteShell';
import ContactSection from './ContactSection';
import { Arrow } from './Icons';
import { C, SERIF, SANS } from '../../lib/brand';
import { TESTIMONIALS } from '../Testimonials';

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

// Taken over from the dental lead page (/zahnzusatz).
const DENTAL_QA = [
  { q: 'Was kostet meine Beratung?', a: 'Nichts.' },
  { q: 'Für wen arbeite ich?', a: 'Für Sie. Nicht für eine Versicherung.' },
  { q: 'Und dann?', a: 'Einmal im Jahr checke ich, ob Ihr Tarif noch der beste ist. Wenn nicht, wechseln wir. Ohne Papierkram für Sie.' },
];

const STATS = [
  { num: '500+', label: 'Zufriedene Kunden' },
  { num: '7+', label: 'Jahre Erfahrung' },
  { num: '100%', label: 'Unabhängig' },
];

const ABOUT = [
  'Seit über sieben Jahren begleite ich Menschen und Unternehmen bei ihrer Absicherung. Mein Ansatz ist einfach: Ich höre zu, verstehe Ihre Situation und entwickle eine Lösung, die wirklich zu Ihnen passt.',
  'Kein Fachjargon und keine Verkaufsgespräche. Stattdessen bekommen Sie eine ehrliche Beratung von jemandem, der sein Handwerk versteht und Ihr Interesse in den Mittelpunkt stellt.',
  'Ob private Krankenversicherung, Zahnzusatz oder betriebliche Themen: Ich finde die Lösung, die genau das abdeckt, was Sie brauchen. Nicht mehr, nicht weniger.',
];

const ABOUT_TAGS = ['Versicherungsmakler nach § 34d GewO', 'Privat und Unternehmen', 'Kostenlose Beratung'];

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

function Area({ area }) {
  return (
    <div id={area.key} style={{ borderTop: `1px solid ${C.lineLight}`, scrollMarginTop: 100, paddingBottom: 32 }}>
      <h3 style={{ margin: 0, padding: '24px 0 28px', color: C.black }}>
        <span style={{
          display: 'block', fontFamily: SERIF, fontWeight: 400,
          fontSize: 'clamp(36px, 4.4vw, 50px)', lineHeight: 1.1, letterSpacing: '-0.01em',
        }}>{area.title}</span>
        <span style={{ display: 'block', marginTop: 12, fontFamily: SANS, fontSize: 14, fontWeight: 400, color: C.graphite }}>{area.sub}</span>
      </h3>
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
  );
}

export default function HomePage() {
  return (
    <SiteShell>
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
            <img src="/logo-white.svg?v=6" alt="Logo von Marco Arpa" className="hero-crest" width="627.6" height="662.3" />
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

      {/* Zahnzusatz, uebernommen von /zahnzusatz */}
      <section id="zahnzusatz" aria-labelledby="zahn-title" style={{ background: C.ivory, color: C.black }}>
        <div style={{ ...WRAP, paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
          <p style={eyebrow(C.champagneDark)}>Zahnzusatzversicherung</p>
          <h2 id="zahn-title" style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(38px, 5.2vw, 64px)',
            lineHeight: 1.06, letterSpacing: '-0.01em', margin: '24px 0 0',
          }}>
            <span style={{ color: C.champagneDark }}>Damit die Zahnkosten</span><br />nicht wehtun.
          </h2>
          <div className="qa-grid">
            {DENTAL_QA.map((x) => (
              <div key={x.q} style={{ borderTop: `1px solid ${C.lineLight}`, paddingTop: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.black }}>{x.q}</p>
                <p style={{ fontSize: 16, lineHeight: 1.6, margin: '6px 0 0', color: C.graphite }}>{x.a}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 36 }}>
            {/* Same gold as the headline above, 20 % larger than the other buttons. */}
            <a href="/zahnzusatz#fragebogen" className="dental-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 29, minHeight: 62, padding: '0 26px',
              background: C.champagneDark, color: C.ivory, textDecoration: 'none', fontSize: 17,
            }}>
              Jetzt Formular ausfüllen <Arrow size={13} />
            </a>
          </div>
          <dl className="stats-row">
            {STATS.map((x) => (
              <div key={x.label} style={{ borderLeft: `1px solid ${C.lineLight}`, paddingLeft: 20 }}>
                <dt style={{ fontSize: 13, color: C.graphite, marginTop: 6, order: 2 }}>{x.label}</dt>
                <dd style={{ margin: 0, fontFamily: SERIF, fontSize: 'clamp(32px, 3.6vw, 42px)', color: C.champagneDark, order: 1 }}>{x.num}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Privat und Unternehmen */}
      <section id="absichern" aria-labelledby="absichern-title" style={{ background: C.ivory, color: C.black, borderTop: `1px solid ${C.lineLight}` }}>
        <div style={{ ...WRAP, paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
          <h2 id="absichern-title" style={{ ...eyebrow(C.champagneDark), fontWeight: 400, marginBottom: 28 }}>Was möchten Sie absichern?</h2>
          <div className="areas-grid">
            {AREAS.map((a) => <Area key={a.key} area={a} />)}
          </div>
        </div>
      </section>

      {/* Person und Betreuung */}
      <section id="ueber-marco" aria-labelledby="person-title" style={{ background: C.black, scrollMarginTop: 76 }}>
        <div className="person-grid" style={{ ...WRAP, paddingTop: 'clamp(64px, 8vw, 104px)', paddingBottom: 'clamp(64px, 8vw, 104px)' }}>
          <div>
            <h2 id="person-title" style={{
              fontFamily: SERIF, fontWeight: 400, color: C.ivory,
              fontSize: 'clamp(34px, 4.2vw, 48px)', lineHeight: 1.12, margin: 0,
            }}>
              Ein Ansprechpartner.<br />Auch danach.
            </h2>
            <p style={{ fontFamily: SERIF, fontSize: 18, color: C.champagne, margin: '28px 0 0' }}>Marco Arpa</p>
            {/* Same black-and-white portrait as on /zahnzusatz, with the offset frame from there
                in brand colours; 640 px source, max 320 px wide for sharp retina display. */}
            <div style={{ position: 'relative', maxWidth: 320, margin: '36px 12px 12px 12px' }}>
              <div aria-hidden="true" style={{
                position: 'absolute', top: -12, left: -12, right: 12, bottom: 12,
                border: '1.5px solid rgba(181,161,113,0.5)',
              }} />
              <div aria-hidden="true" style={{
                position: 'absolute', top: 12, left: 12, right: -12, bottom: -12,
                background: `linear-gradient(135deg, ${C.champagne}, ${C.champagneDark})`, opacity: 0.22,
              }} />
              <img
                src="/marco.jpg" alt="Porträt von Marco Arpa" width="640" height="640" loading="lazy"
                style={{ position: 'relative', zIndex: 1, display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          </div>
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 26, color: C.ivory, margin: 0 }}>Hallo, ich bin Marco.</p>
            {ABOUT.map((t) => (
              <p key={t.slice(0, 20)} style={{ fontSize: 15, lineHeight: 1.75, color: C.grey, margin: '18px 0 0', maxWidth: 460 }}>{t}</p>
            ))}
            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 36px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ABOUT_TAGS.map((t) => (
                <li key={t} style={{ fontSize: 12, color: C.champagne, border: '1px solid rgba(181,161,113,0.45)', padding: '7px 12px' }}>{t}</li>
              ))}
            </ul>
            <div style={{ borderTop: `1px solid ${C.lineDark}`, borderBottom: `1px solid ${C.lineDark}` }}>
              <h3 style={{
                margin: 0, minHeight: 56, display: 'flex', alignItems: 'center',
                color: C.ivory, fontFamily: SANS, fontSize: 14, fontWeight: 400,
              }}>
                So arbeite ich
              </h3>
              <ol id="so-arbeite-ich" style={{ listStyle: 'none', margin: 0, padding: '0 0 12px' }}>
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

      {/* Kundenstimmen, uebernommen von /zahnzusatz */}
      <section id="kundenstimmen" aria-labelledby="stimmen-title" style={{ background: C.ivory, color: C.black }}>
        <div style={{ ...WRAP, paddingTop: 'clamp(64px, 8vw, 104px)', paddingBottom: 'clamp(64px, 8vw, 104px)' }}>
          <p style={eyebrow(C.champagneDark)}>Kundenstimmen</p>
          <h2 id="stimmen-title" style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(34px, 4.2vw, 48px)', lineHeight: 1.12, margin: '24px 0 0',
          }}>
            Was Kunden sagen.
          </h2>
          <div className="quotes-grid">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} style={{ margin: 0, borderTop: `1px solid ${C.lineLight}`, paddingTop: 24 }}>
                <div aria-label={`${t.rating} von 5 Sternen`} role="img" style={{ color: C.champagneDark, letterSpacing: 3, fontSize: 14 }}>
                  {'★'.repeat(t.rating)}
                </div>
                <blockquote style={{ margin: '16px 0 0', fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: C.black }}>
                  {t.text}
                </blockquote>
                <figcaption style={{ marginTop: 20, fontSize: 14 }}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{t.name}</span>
                  <span style={{ display: 'block', color: C.graphite, marginTop: 2, fontSize: 13 }}>{t.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />

      <style jsx global>{`
        .hero-grid {
          display: grid; grid-template-columns: minmax(0, 1fr) auto;
          align-items: center; gap: 48px;
        }
        .hero-crest { width: clamp(220px, 25vw, 300px); height: auto; display: block; }
        .hero-cta { transition: background 0.2s ease; }
        .hero-cta:hover { background: #ffffff !important; }
        .areas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 clamp(32px, 5vw, 72px); align-items: start; }
        .person-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        .qa-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px clamp(24px, 3vw, 40px); margin-top: 40px; }
        .stats-row { display: flex; flex-wrap: wrap; gap: 24px clamp(32px, 5vw, 64px); margin: 56px 0 0; }
        .stats-row > div { display: flex; flex-direction: column; }
        .dental-primary { transition: background 0.2s ease; }
        .dental-primary:hover { background: #685a3b !important; }
        .quotes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px clamp(24px, 3vw, 48px); margin-top: 48px; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .hero-crest { width: 180px; justify-self: end; }
          .areas-grid { grid-template-columns: 1fr; }
          .areas-grid > div:last-child { border-bottom: 1px solid ${C.lineLight}; }
          .person-grid { grid-template-columns: 1fr; gap: 40px; }
          .qa-grid, .quotes-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </SiteShell>
  );
}
