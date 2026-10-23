'use client';

import { useState, useEffect } from 'react';
import SiteShell from './SiteShell';
import ContactSection from './ContactSection';
import DentalReveal from './DentalReveal';
import Texture from './Texture';
import { Arrow } from './Icons';
import { C, SERIF, SANS } from '../../lib/brand';
import { TESTIMONIALS } from '../Testimonials';

const HERO_POSTER = '/video/header-poster.jpg';

const WRAP = { maxWidth: 1120, margin: '0 auto', padding: '0 clamp(20px, 5vw, 56px)' };

const eyebrow = (color) => ({
  fontFamily: SANS, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
  color, margin: 0,
});

// Texts supplied by Marco (23.10.2026).
const AREAS = [
  {
    key: 'privat',
    title: 'Privat.',
    sub: 'Ihre Absicherung verdient mehr als einen Tarifvergleich.',
    intro: [
      'Jede Lebensphase bringt neue Chancen, Veränderungen und Herausforderungen mit sich. Ob berufliche Entwicklung, Familienzuwachs oder der Kauf einer Immobilie: Ich begleite Sie langfristig und passe Ihre Absicherung gemeinsam mit Ihnen an Ihre persönliche Situation an.',
      'Als zentraler Ansprechpartner behalte ich Ihre Versicherungsangelegenheiten im Blick, überprüfe regelmäßig mögliche Optimierungen und achte auf ein ausgewogenes Verhältnis von Preis und Leistung.',
      'Dabei steht Vertrauen für mich an erster Stelle. Ich berate transparent, nehme Ihnen organisatorischen Aufwand ab und bin auch im Schadenfall persönlich an Ihrer Seite, weit über den Vertragsabschluss hinaus.',
    ],
  },
  {
    key: 'unternehmen',
    title: 'Unternehmen.',
    sub: 'Sie führen Ihr Unternehmen. Ich kümmere mich um Ihre Absicherung.',
    intro: [
      'Als Unternehmer weiß ich, wie wertvoll Ihre Zeit ist. Deshalb übernehme ich die Koordination Ihrer Versicherungsangelegenheiten, analysiere betriebliche Risiken und entwickle bedarfsgerechte Lösungen, die Ihnen im Geschäftsalltag den Rücken freihalten.',
      'Ob neue Mitarbeiter, Investitionen oder die Weiterentwicklung Ihres Unternehmens: Ich begleite Sie langfristig, überprüfe Ihre Absicherung regelmäßig und identifiziere Möglichkeiten, Leistungen und Kosten sinnvoll zu optimieren.',
      [{ em: 'Sie profitieren von einem festen Ansprechpartner, kurzen Kommunikationswegen und persönlicher Unterstützung im Schadenfall.' }, ' Damit Sie sich auf das konzentrieren können, was wirklich zählt: Ihr Unternehmen.'],
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
  'Meine Vorstellung von guter Beratung entstand aus einer persönlichen Erfahrung: Ich habe miterlebt, welche finanziellen Folgen unzureichende Beratung für meine eigene Familie haben kann. Diese Erfahrung hat mich nachhaltig geprägt und meinen Anspruch gefestigt, Menschen ehrlich, transparent und mit einem klaren Verantwortungsbewusstsein zu beraten.',
  'Nach meinem Betriebswirtschaftsstudium und meiner Tätigkeit im Management begann ich 2018 meine Selbstständigkeit in der Versicherungsbranche. Seit 2024 bin ich als Versicherungsmakler tätig, um meine Beratung noch individueller und mit größerer Freiheit bei der Auswahl geeigneter Lösungen gestalten zu können.',
  'Vertrauen, Loyalität und Verlässlichkeit sind für mich keine leeren Versprechen, sondern die Grundlage meiner täglichen Arbeit. Mein Anspruch ist es, meine Kunden langfristig zu begleiten, ihre Interessen konsequent in den Mittelpunkt zu stellen und auch dann persönlich an ihrer Seite zu stehen, wenn es darauf ankommt.',
  'Denn für mich endet Verantwortung nicht mit einer Unterschrift. Sie zeigt sich vor allem in dem, was danach kommt.',
];

const ABOUT_TAGS = ['Versicherungsmakler nach § 34d GewO', 'Privat und Unternehmen', 'Kostenlose Beratung und Betreuung'];


// Looping background clip behind the hero text. Rendered only after mount and only
// when the visitor allows motion; otherwise the poster (section background) stays.
// Source: Header_v1.mp4, re-encoded as H.264 without audio, end crossfaded into the start.
function HeroVideo() {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionOk(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {motionOk && (
        <video
          autoPlay muted loop playsInline preload="auto" poster={HERO_POSTER}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/video/header-720.mp4" type="video/mp4" media="(max-width: 900px)" />
          <source src="/video/header-1080.mp4" type="video/mp4" />
        </video>
      )}
      {/* Darkens the clip so the ivory text keeps its contrast, strongest behind the text. */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(9,9,9,0.86) 0%, rgba(9,9,9,0.62) 50%, rgba(9,9,9,0.42) 100%), linear-gradient(180deg, rgba(9,9,9,0.35) 0%, rgba(9,9,9,0) 30%, rgba(9,9,9,0) 70%, rgba(9,9,9,0.6) 100%)',
      }} />
    </div>
  );
}

// Two cards side by side: Privat light, Unternehmen dark, so the pair reads as one
// decision. Numbered 01 and 02; title, italic lead sentence, then Marco's paragraphs.
function Area({ area, index }) {
  const dark = index === 1;
  const fg = dark ? C.ivory : C.black;
  const muted = dark ? C.grey : C.graphite;
  return (
    <article id={area.key} aria-labelledby={`${area.key}-title`} style={{
      scrollMarginTop: 100, borderRadius: 24, padding: 'clamp(28px, 4vw, 48px)',
      background: dark ? C.black : '#F8F6F0', color: fg,
      border: `1px solid ${dark ? C.black : C.lineLight}`,
    }}>
      <p style={{ ...eyebrow(dark ? C.champagne : C.champagneDark), fontFamily: SERIF, letterSpacing: '0.12em' }}>
        {String(index + 1).padStart(2, '0')}
      </p>
      <h3 id={`${area.key}-title`} style={{ margin: '20px 0 0', color: fg }}>
        <span style={{
          display: 'block', fontFamily: SERIF, fontWeight: 400,
          fontSize: 'clamp(36px, 4.4vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.01em',
        }}>{area.title}</span>
        <span style={{
          display: 'block', marginTop: 14, fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 18, fontWeight: 400, color: dark ? C.champagne : C.champagneDark,
        }}>{area.sub}</span>
      </h3>
      {/* Paragraphs are strings, or arrays of strings and { em } parts set in italics. */}
      {area.intro.map((para, i) => (
        <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: muted, margin: i === 0 ? '24px 0 0' : '14px 0 0', maxWidth: 460 }}>
          {[].concat(para).map((part, j) => (part.em
            ? <em key={j} style={{ color: fg, fontStyle: 'italic' }}>{part.em}</em>
            : <span key={j}>{part}</span>))}
        </p>
      ))}
    </article>
  );
}

export default function HomePage() {
  return (
    <SiteShell>
      {/* Einstieg */}
      <section id="top" aria-labelledby="hero-title" style={{
        position: 'relative', overflow: 'hidden',
        background: `${C.black} url(${HERO_POSTER}) center / cover no-repeat`,
      }}>
        <HeroVideo />
        <div style={{ ...WRAP, position: 'relative', paddingTop: 'clamp(56px, 9vw, 112px)', paddingBottom: 'clamp(28px, 4vw, 40px)' }}>
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
              <p style={{
                display: 'flex', alignItems: 'center', gap: 16, margin: '30px 0 0',
                fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(18px, 1.7vw, 22px)',
                color: 'rgba(241,238,230,0.82)', letterSpacing: '0.01em',
              }}>
                <span aria-hidden="true" style={{ flex: 'none', width: 36, height: 1, background: C.champagne }} />
                {/* Each claim stays on one line, so the three only break between each other. */}
                <span>
                  <span style={{ whiteSpace: 'nowrap' }}>Ein Ansprechpartner.</span>{' '}
                  <span style={{ whiteSpace: 'nowrap' }}>Kontinuierliche Optimierung.</span>{' '}
                  <span style={{ whiteSpace: 'nowrap' }}>Persönliche Verantwortung.</span>
                </span>
              </p>
            </div>
            <img src="/logo-white.svg?v=6" alt="Logo von Marco Arpa" className="hero-crest" width="627.6" height="662.3" />
          </div>

          <div className="hero-foot" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px 16px',
            flexWrap: 'wrap', marginTop: 'clamp(56px, 9vw, 120px)', fontSize: 12, color: C.grey,
          }}>
            {/* Frosted pill, so the button sits on the video instead of covering it. */}
            <a href="#kontakt" className="hero-cta" style={{
              display: 'inline-flex', alignItems: 'center', gap: 18,
              minHeight: 52, padding: '0 26px', borderRadius: 999,
              background: 'rgba(241,238,230,0.1)', border: '1px solid rgba(241,238,230,0.38)',
              backdropFilter: 'blur(14px) saturate(140%)', WebkitBackdropFilter: 'blur(14px) saturate(140%)',
              color: C.ivory, textDecoration: 'none', fontSize: 14,
            }}>
              Lassen Sie uns sprechen <Arrow size={11} />
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              Privatkunden &amp; Unternehmen
              <span aria-hidden="true" style={{ width: 40, height: 1, background: C.champagne }} />
              Deutschlandweit
            </span>
          </div>
        </div>
      </section>

      {/* Zahnzusatz, uebernommen von /zahnzusatz; the button opens the questionnaire in place */}
      <DentalReveal teaser={(openForm) => (
        <section id="zahnzusatz" aria-labelledby="zahn-title" style={{ position: 'relative', isolation: 'isolate', background: C.ivory, color: C.black }}>
          <Texture name="marmor" />
          <div style={{ ...WRAP, position: 'relative', paddingTop: 'clamp(56px, 7vw, 88px)', paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
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
              <a href="/zahnzusatz#fragebogen" onClick={openForm} className="dental-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: 29, minHeight: 62, padding: '0 30px',
                borderRadius: 999, background: C.champagneDark, color: C.ivory, textDecoration: 'none', fontSize: 17,
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
      )} />

      {/* Privat und Unternehmen */}
      {/* Clear seam to the dental section above: a shadow falling onto this section, a
          champagne line across the full width and a small medallion in its centre. The
          plain sand tone sets this chapter apart from the white marble above. */}
      <section id="absichern" aria-labelledby="absichern-title" style={{
        position: 'relative', background: C.stone, color: C.black,
        // Shadow on both edges, so the sand area reads as one recessed panel. The bottom one
        // is stronger: next to the black section below, the same value would barely show.
        boxShadow: 'inset 0 22px 28px -22px rgba(9,9,9,0.22), inset 0 -28px 32px -22px rgba(9,9,9,0.4)',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1,
          background: `linear-gradient(90deg, transparent, ${C.champagne} 18%, ${C.champagne} 82%, transparent)`,
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1,
          width: 34, height: 34, borderRadius: '50%', background: C.ivory,
          border: `1px solid ${C.champagne}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ width: 7, height: 7, background: C.champagne, transform: 'rotate(45deg)' }} />
        </div>
        <div style={{ ...WRAP, position: 'relative', paddingTop: 'clamp(72px, 9vw, 112px)', paddingBottom: 'clamp(64px, 8vw, 104px)' }}>
          <p style={eyebrow(C.champagneDark)}>Leistungen</p>
          <h2 id="absichern-title" style={{
            fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(34px, 4.2vw, 48px)', lineHeight: 1.12, margin: '24px 0 0',
          }}>
            Was möchten Sie absichern?
          </h2>
          <div className="areas-grid">
            {AREAS.map((a, i) => <Area key={a.key} area={a} index={i} />)}
          </div>
        </div>
      </section>

      {/* Person und Betreuung */}
      <section id="ueber-marco" aria-labelledby="person-title" style={{ position: 'relative', isolation: 'isolate', background: C.black, scrollMarginTop: 76 }}>
        <Texture name="damast" />
        <div className="person-grid" style={{ ...WRAP, position: 'relative', paddingTop: 'clamp(64px, 8vw, 104px)', paddingBottom: 'clamp(64px, 8vw, 104px)' }}>
          <div>
            <h2 id="person-title" style={{
              fontFamily: SERIF, fontWeight: 400, color: C.ivory,
              fontSize: 'clamp(34px, 4.2vw, 48px)', lineHeight: 1.12, margin: 0,
            }}>
              Ein Ansprechpartner.<br />Auch danach.
            </h2>
            <p style={{ fontFamily: SERIF, fontSize: 18, color: C.champagne, margin: '28px 0 0' }}>Marco Arpa</p>
            <p style={{ fontSize: 13, letterSpacing: '0.04em', color: C.grey, margin: '6px 0 0' }}>Geschäftsführer</p>
            {/* Colour portrait (Oct 2026) with the offset frame in brand colours; 640 x 768 px
                source, max 320 px wide for sharp retina display. Bump ?v= when replacing it. */}
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
                src="/marco.jpg?v=2" alt="Porträt von Marco Arpa" width="640" height="768" loading="lazy"
                style={{ position: 'relative', zIndex: 1, display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          </div>
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 26, color: C.ivory, margin: 0 }}>Hallo, ich bin Marco.</p>
            {/* The last paragraph is the closing thought, set as a serif quote line. */}
            {ABOUT.map((t, i) => (i === ABOUT.length - 1
              ? <p key={t.slice(0, 20)} style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, lineHeight: 1.5, color: C.ivory, margin: '24px 0 0', maxWidth: 460 }}>{t}</p>
              : <p key={t.slice(0, 20)} style={{ fontSize: 15, lineHeight: 1.75, color: C.grey, margin: '18px 0 0', maxWidth: 460 }}>{t}</p>
            ))}
            <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ABOUT_TAGS.map((t) => (
                <li key={t} style={{ fontSize: 12, color: C.champagne, border: '1px solid rgba(181,161,113,0.45)', padding: '7px 12px' }}>{t}</li>
              ))}
            </ul>
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
        .hero-cta { transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        .hero-cta:hover { background: ${C.ivory} !important; color: ${C.black} !important; border-color: ${C.ivory} !important; }
        .areas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: stretch; margin-top: 48px; }
        .person-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        .qa-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px clamp(24px, 3vw, 40px); margin-top: 40px; }
        .stats-row { display: flex; flex-wrap: wrap; gap: 24px clamp(32px, 5vw, 64px); margin: 56px 0 0; }
        .stats-row > div { display: flex; flex-direction: column; }
        .dental-primary { transition: background 0.2s ease; }
        .dental-primary:hover { background: #685a3b !important; }
        .quotes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px clamp(24px, 3vw, 48px); margin-top: 48px; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr; gap: 36px; }
          .hero-crest { width: 116px; justify-self: center; order: -1; }
          .hero-foot { flex-direction: column; align-items: flex-start !important; }
          .areas-grid { grid-template-columns: 1fr; }
          .person-grid { grid-template-columns: 1fr; gap: 40px; }
          .qa-grid, .quotes-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </SiteShell>
  );
}
