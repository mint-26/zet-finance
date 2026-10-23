'use client';

import { useRef, useState, useEffect } from 'react';
import { Arrow } from './Icons';
import { C, SERIF, SANS } from '../../lib/brand';

// Product portfolio as a horizontal card slider (idea taken from zet-finance.com/#portfolio,
// texts written for Marco). Insurance topics only: the imprint names a § 34d licence, so
// real-estate loans (§ 34i) and investments (§ 34f) stay out until Marco confirms them.
// The product list still needs Marco's confirmation (draft, 23.10.2026).
// Photos: Unsplash and Pexels (free licences, Gesundheit: Pexels 4173251 by Gustavo Fring),
// picked by Adrian, 800 x 600 px in public/portfolio/.
const PRODUCTS = [
  {
    area: 'Gesundheit',
    image: '/portfolio/gesundheit.jpg',
    alt: 'Lächelnde Ärztin mit Stethoskop',
    title: 'Gut versorgt, wenn es darauf ankommt.',
    text: 'Ob private Krankenversicherung oder gesetzlich mit Ergänzung: Ich vergleiche Tarife, prüfe einen Wechsel und finde die Zusatzbausteine, die Ihre Versorgung sinnvoll erweitern.',
    tags: ['Private Krankenversicherung', 'Zahnzusatz', 'Krankenhauszusatz', 'Ambulante Zusatzversicherung'],
  },
  {
    area: 'Arbeitskraft',
    image: '/portfolio/arbeitskraft.jpg',
    alt: 'Handwerker bearbeitet ein Stück Holz',
    title: 'Ihr Einkommen, verlässlich abgesichert.',
    text: 'Ihre Arbeitskraft ist Ihr wichtigstes Kapital. Ich zeige Ihnen, welche Absicherung zu Ihrem Beruf und Ihrer Lebenslage passt, und worauf es im Leistungsfall ankommt.',
    tags: ['Berufsunfähigkeit', 'Dienstunfähigkeit', 'Grundfähigkeit', 'Unfall', 'Schwere Krankheiten', 'Risikolebensversicherung'],
  },
  {
    area: 'Altersvorsorge',
    image: '/portfolio/altersvorsorge.jpg',
    alt: 'Älteres Paar beim Spaziergang',
    title: 'Vorsorgen mit einem klaren Plan.',
    text: 'Gemeinsam ermitteln wir Ihre Versorgungslücke und schließen sie Schritt für Schritt. So wissen Sie, womit Sie im Ruhestand rechnen können.',
    tags: ['Private Rentenversicherung', 'Staatlich geförderte Vorsorge', 'Betriebliche Altersvorsorge'],
  },
  {
    area: 'Eigentum und Haftung',
    image: '/portfolio/eigentum.jpg',
    alt: 'Helle Chaiselongue am Fenster',
    title: 'Schutz für alles, was Ihnen gehört.',
    text: 'Ein Schaden in der Wohnung, am Auto oder gegenüber Dritten kann teuer werden. Ich sorge dafür, dass Ihre Verträge zusammenpassen und keine Lücken lassen.',
    tags: ['Privathaftpflicht', 'Hausrat', 'Wohngebäude', 'Kfz', 'Rechtsschutz'],
  },
  {
    area: 'Haustiere',
    image: '/portfolio/haustiere.jpg',
    alt: 'Porträt eines Weimaraners',
    title: 'Gut versorgt, auch auf vier Pfoten.',
    text: 'Tierarzt und Operationen können schnell ins Geld gehen. Mit der passenden Absicherung entscheiden Sie im Ernstfall für Ihr Tier, nicht für Ihr Konto.',
    tags: ['Tierkrankenversicherung', 'OP-Versicherung', 'Tierhalterhaftpflicht'],
  },
  {
    area: 'Unternehmen',
    image: '/portfolio/unternehmen.jpg',
    alt: 'Besprechung im Team mit Laptops',
    title: 'Ihr Betrieb, rundum abgesichert.',
    text: 'Von der Absicherung betrieblicher Risiken bis zu Leistungen für Ihre Mitarbeiter: Ich koordiniere die Verträge und behalte sie für Sie im Blick.',
    tags: ['Betriebliche Krankenversicherung', 'Betriebliche Altersvorsorge', 'Betriebshaftpflicht', 'Inhalts- und Gebäudeversicherung'],
  },
  {
    area: 'Energie',
    image: '/portfolio/energie.jpg',
    alt: 'Glühbirne in Nahaufnahme',
    title: 'Strom und Gas zum fairen Preis.',
    text: 'Neben Versicherungen vergleiche ich auch Ihre Energieverträge und übernehme den Wechsel, wenn sich ein besserer Tarif findet.',
    tags: ['Strom', 'Gas'],
  },
];

// Left padding of the slider: aligned with the page content (max 1120 px), so the first
// card starts under the heading while the next cards run out to the screen edge.
const EDGE = 'max(clamp(20px, 5vw, 56px), calc((100vw - 1120px) / 2 + clamp(20px, 5vw, 56px)))';

export default function Portfolio() {
  const track = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    const onScroll = () => {
      const cards = [...el.children];
      const left = el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft);
      let best = 0;
      cards.forEach((c, i) => {
        if (Math.abs(c.getBoundingClientRect().left - left) < Math.abs(cards[best].getBoundingClientRect().left - left)) best = i;
      });
      setActive(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const go = (i) => {
    const el = track.current;
    const card = el.children[Math.max(0, Math.min(PRODUCTS.length - 1, i))];
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: card.offsetLeft - el.children[0].offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <div id="portfolio" style={{ position: 'relative', scrollMarginTop: 100 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(20px, 5vw, 56px)' }}>
        <div className="pf-head">
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.champagneDark, margin: 0 }}>
              Produktportfolio
            </p>
            <h3 style={{
              fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.15,
              margin: '20px 0 0', color: C.black,
            }}>
              Lösungen für jede Lebenslage.
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.graphite, margin: '14px 0 0', maxWidth: 520 }}>
              Ein Überblick über die Bereiche, in denen ich Sie berate. Welche davon für Sie wichtig sind, klären wir gemeinsam.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="pf-nav" aria-label="Vorheriger Bereich" onClick={() => go(active - 1)} disabled={active === 0}>
              <span style={{ display: 'inline-flex', transform: 'rotate(-135deg)' }}><Arrow size={12} /></span>
            </button>
            <button type="button" className="pf-nav" aria-label="Nächster Bereich" onClick={() => go(active + 1)} disabled={active === PRODUCTS.length - 1}>
              <span style={{ display: 'inline-flex', transform: 'rotate(45deg)' }}><Arrow size={12} /></span>
            </button>
          </div>
        </div>
      </div>

      <ul ref={track} className="pf-track" aria-label="Produktportfolio" style={{ paddingLeft: EDGE, paddingRight: EDGE, scrollPaddingLeft: EDGE }}>
        {PRODUCTS.map((p, i) => (
          <li key={p.area} className="pf-card" aria-label={`${i + 1} von ${PRODUCTS.length}: ${p.area}`}>
            <img src={p.image} alt={p.alt} width="800" height="600" loading="lazy" className="pf-img" />
            <div className="pf-body">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span style={{ fontFamily: SERIF, fontSize: 15, color: C.champagneDark }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.graphite }}>{p.area}</span>
              </div>
              <h4 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(24px, 2.4vw, 28px)', lineHeight: 1.2, margin: '28px 0 0', color: C.black }}>
                {p.title}
              </h4>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: C.graphite, margin: '16px 0 0' }}>{p.text}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', paddingTop: 28, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {p.tags.map((t) => (
                  <li key={t} style={{
                    fontSize: 12, color: C.black, padding: '7px 12px', borderRadius: 999,
                    border: `1px solid ${C.lineLight}`, background: C.ivory,
                  }}>{t}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      <div role="tablist" aria-label="Bereich wählen" style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 20 }}>
        {PRODUCTS.map((p, i) => (
          <button
            key={p.area} type="button" role="tab" aria-selected={active === i} aria-label={p.area}
            onClick={() => go(i)} className="pf-dot"
          >
            <span style={{
              display: 'block', height: 6, borderRadius: 999,
              width: active === i ? 22 : 6,
              background: active === i ? C.champagneDark : 'rgba(9,9,9,0.22)',
              transition: 'width 0.4s cubic-bezier(0.65, 0, 0.35, 1), background 0.4s ease',
            }} />
          </button>
        ))}
      </div>

      <style jsx global>{`
        .pf-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
        .pf-track {
          list-style: none; margin: 40px 0 0; padding-top: 4px; padding-bottom: 8px;
          display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory;
          scrollbar-width: none; -webkit-overflow-scrolling: touch;
        }
        .pf-track::-webkit-scrollbar { display: none; }
        .pf-card {
          flex: 0 0 clamp(280px, 32vw, 380px); scroll-snap-align: start;
          display: flex; flex-direction: column;
          background: #F8F6F0; border: 1px solid ${C.lineLight}; border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(9,9,9,0.04), 0 12px 32px -20px rgba(9,9,9,0.25);
        }
        .pf-img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover; }
        .pf-body { flex: 1; display: flex; flex-direction: column; padding: clamp(24px, 2.8vw, 32px); }
        .pf-nav {
          width: 48px; height: 48px; border-radius: 50%; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: ${C.black}; border: 1px solid ${C.champagneDark};
          font-family: ${SANS}; transition: background 0.25s ease, color 0.25s ease, opacity 0.25s ease;
        }
        .pf-nav:hover:not(:disabled) { background: ${C.black}; color: ${C.ivory}; border-color: ${C.black}; }
        .pf-nav:disabled { opacity: 0.3; cursor: default; }
        .pf-dot { background: none; border: 0; padding: 10px 4px; cursor: pointer; min-height: 26px; }
        @media (max-width: 860px) {
          .pf-head { flex-direction: column; align-items: flex-start; }
          .pf-head > div:last-child { display: none !important; }
          .pf-card { flex-basis: 84vw; }
        }
      `}</style>
    </div>
  );
}
