'use client';

import { useInView } from './useInView';
import { C, SERIF } from '../lib/brand';

const STEPS = [
  { num: '01', title: 'Kurzes Gespräch', desc: '5 Minuten reichen. Wir klären Ihre Zahnsituation und was Ihnen wichtig ist. Telefonisch, per WhatsApp oder vor Ort.' },
  { num: '02', title: 'Fragebogen ausfüllen', desc: 'Ein paar Fragen zu Ihren Zähnen und Ihrer Gesundheit direkt hier auf der Website. Dauert 2 Minuten.' },
  { num: '03', title: 'Ihr persönliches Angebot', desc: 'Ich vergleiche den gesamten Markt und finde den Tarif, der zu Ihren Zähnen und Ihrem Budget passt. Keine Standardlösung.' },
  { num: '04', title: 'Rechnung einreichen, fertig', desc: 'Sie reichen Ihre Zahnarztrechnung ein. Den Rest erledige ich. Kommunikation mit der Versicherung, Nachfragen, Abwicklung. Und wenn mal was ist: Ich bin 24/7, 365 Tage im Jahr für Sie erreichbar.' },
];

// Process steps on /zahnzusatz, in the layout of the start page (lib/brand.js):
// four columns with a hairline on top, two on tablets, one on phones.
export default function Process() {
  const [ref, inView] = useInView();

  return (
    <section id="process" ref={ref} aria-labelledby="process-title" style={{
      background: C.ivory, color: C.black, borderTop: `1px solid ${C.lineLight}`,
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(64px, 8vw, 104px) clamp(20px, 5vw, 56px)' }}>
        <p style={{
          fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
          color: C.champagneDark, margin: 0,
        }}>
          Ablauf
        </p>
        <h2 id="process-title" style={{
          fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(34px, 4.2vw, 48px)',
          lineHeight: 1.12, margin: '24px 0 0', color: C.black,
        }}>
          So läuft&apos;s ab.
        </h2>

        <ol className="process-grid">
          {STEPS.map((step, i) => (
            <li key={step.num} style={{
              borderTop: `1px solid ${C.lineLight}`, paddingTop: 22,
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
            }}>
              <span style={{ display: 'block', fontFamily: SERIF, fontSize: 40, lineHeight: 1, color: C.champagneDark }}>{step.num}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.black, margin: '20px 0 0' }}>{step.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: C.graphite, margin: '8px 0 0' }}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>

      <style jsx>{`
        .process-grid {
          list-style: none; padding: 0; margin: 48px 0 0;
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 40px clamp(24px, 3vw, 40px);
        }
        @media (max-width: 960px) {
          .process-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .process-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </section>
  );
}
