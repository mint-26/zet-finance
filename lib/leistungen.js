// Benefits per tariff for the offer comparison (CRM "Angebot erstellen"), taken from Marco's Canva
// offers (Stand 16.11.2026: "ZZV 100%" with Allianz, Münchener Verein and BBKK). A tariff without an
// entry here shows "Angaben folgen" in the offer. New tariffs: add an entry with the same keys.
//
// A cell is { s, t }: s = 'ja' (green tick), 'nein' (red mark) or undefined (plain text), t = text.
// Line breaks in t stay. Leistungsbegrenzung is a staircase: maximum per calendar year (KJ) since the
// start; the CRM writes the years itself from the insurance start.

export const LEISTUNGEN_STAND = '16.11.2026';
// Where the star ratings come from, printed under the offer. Marco to confirm the exact source.
export const BEWERTUNG_QUELLE = 'Kundenbewertungen laut Vergleichsunterlagen von Marco Arpa, Stand 16.11.2026';

// Rows of the comparison, in the order of Marco's offers. note: small grey text under the label.
export const SECTIONS = [
  {
    key: 'zahnersatz', title: 'Zahnersatz', note: true,
    rows: [
      ['kronen', 'Kronen, Brücken, Prothesen'], ['implantate', 'Implantate'], ['inlays', 'Inlays'], ['veneers', 'Veneers'],
      ['knochenaufbau', 'Knochenaufbau'], ['labor', 'Material- und Laborkosten'],
      ['funktionsdiagnostik', 'Funktionsdiagnostik', 'im Rahmen von Zahnersatz'],
      ['schleimhautZe', 'Schleimhauttransplantation', 'im Rahmen von Zahnersatz'],
      ['basisZe', 'Erstattungsbasis'], ['besonderheitenZe', 'Besonderheiten Erstattung'],
      ['gozZe', 'max. Faktor nach der GOZ'], ['wartezeitZe', 'Wartezeit'],
    ],
  },
  {
    key: 'zahnbehandlung', title: 'Zahnbehandlung', note: true,
    rows: [
      ['fuellungen', 'Kunststoff-Füllungen'], ['wurzel', 'Wurzelbehandlung'], ['paro', 'Parodontale Behandlungen'],
      ['fissuren', 'Fissurenversiegelung'], ['schleimhautZb', 'Schleimhauttransplantation', 'im Rahmen von Zahnbehandlung'],
      ['basisZb', 'Erstattungsbasis'], ['besonderheitenZb', 'Besonderheiten Erstattung'],
      ['gozZb', 'max. Faktor nach der GOZ'], ['wartezeitZb', 'Wartezeit'],
    ],
  },
  {
    key: 'pzr', title: 'Professionelle Zahnreinigung', note: true,
    rows: [['pzr', 'Professionelle Zahnreinigung'], ['besonderheitenPzr', 'Besonderheiten Erstattung'], ['wartezeitPzr', 'Wartezeit']],
  },
  {
    key: 'kfo', title: 'Kieferorthopädie für Kinder',
    rows: [['kfo', 'Kieferorthopädie'], ['besonderheitenKfo', 'Besonderheiten Erstattung'], ['wartezeitKfo', 'Wartezeit']],
  },
  {
    key: 'sonder', title: 'Sonderleistungen',
    rows: [['bleaching', 'Bleaching'], ['narkose', 'Narkose'], ['vorversicherung', 'Vorversicherungsvorteile']],
  },
  {
    key: 'allgemein', title: 'Allgemeine Merkmale',
    rows: [
      ['wartezeit', 'Wartezeit'], ['begrenzung', 'Leistungsbegrenzungen'],
      ['ohneKasse', 'Behandlung bei Ärzten ohne Kassenzulassung', 'z.B. Privatarzt, im Ausland'],
      ['mindestlaufzeit', 'Mindestvertragslaufzeit', 'zu Beginn des Vertrags'], ['kuendigung', 'Kündigungsfrist'],
    ],
  },
];

const ja = (t = '') => ({ s: 'ja', t });
const nein = (t = 'Nicht enthalten') => ({ s: 'nein', t });
const txt = (t) => ({ t });

const HUNDERT = ja('100 %');
const OHNE_WZ = txt('Ohne Wartezeit');
const GOZ = txt('3,5-facher Satz der Gebührenordnung (GOZ)');
const BASIS = 'Der Erstattungssatz von 100 % bezieht sich auf den Rechnungsbetrag, Zuzahlungen der Krankenkasse sind enthalten.';
const BASIS_SOFERN = 'Der Erstattungssatz von 100 % bezieht sich auf den Rechnungsbetrag, Zuzahlungen der Krankenkasse sind enthalten, sofern nicht anders gekennzeichnet.';
const ALLES_100 = Object.fromEntries(['kronen', 'implantate', 'inlays', 'veneers', 'knochenaufbau', 'labor', 'funktionsdiagnostik', 'schleimhautZe', 'fuellungen', 'wurzel', 'paro', 'fissuren', 'schleimhautZb'].map((k) => [k, HUNDERT]));
const GEMEINSAM = {
  ...ALLES_100,
  gozZe: GOZ, gozZb: GOZ, wartezeitZe: OHNE_WZ, wartezeitZb: OHNE_WZ, wartezeitPzr: OHNE_WZ, wartezeitKfo: OHNE_WZ, wartezeit: OHNE_WZ,
  bleaching: nein(), narkose: ja(), vorversicherung: nein(),
};

// Keyed "Gesellschaft|Tarif", with the names used in lib/tarife.js.
export const LEISTUNGEN = {
  'Allianz|MeinZahnschutz 100': {
    sterne: 4.2, noten: { zahnersatz: 'exzellent', zahnbehandlung: 'exzellent', pzr: 'exzellent' },
    ...GEMEINSAM,
    basisZe: txt(BASIS), besonderheitenZe: txt('-'), basisZb: txt(BASIS),
    pzr: ja('Ohne Begrenzung'),
    kfo: ja('Ohne Zuzahlung Krankenkasse: 100 %, max. 3.000 €\nMit Zuzahlung Krankenkasse: 100 %, max. 3.000 € je Behandlungsfall'),
    besonderheitenKfo: txt('Erstattung erfolgt bis zum Alter von 20 Jahren'),
    begrenzung: { staffel: [1000, 2500, 4000], hinweis: 'Ausschlaggebend ist das jeweilige Behandlungsdatum.' },
    ohneKasse: txt('Bis zu 25 % geringere Erstattung'),
    mindestlaufzeit: txt('2 Jahre, das erste Versicherungsjahr endet am 31. Dezember des betreffenden Kalenderjahres.'),
    kuendigung: txt('1 Monat zum Ende eines Kalenderjahres'),
  },
  'Münchener Verein|ZahnGesund 100': {
    sterne: 4.3, noten: { zahnersatz: 'exzellent', zahnbehandlung: 'exzellent', pzr: 'exzellent' },
    ...GEMEINSAM,
    basisZe: txt(BASIS), basisZb: txt(BASIS_SOFERN),
    pzr: ja('200 € pro Kalenderjahr (2 x 100 €) für alle Prophylaxemaßnahmen'),
    kfo: ja('Ohne Zuzahlung Krankenkasse: 65 %, max. 5.000 €\nMit Zuzahlung Krankenkasse: 100 %, max. 5.000 € für die gesamte Vertragslaufzeit'),
    besonderheitenKfo: txt('Erstattung erfolgt bis zum Alter von 18 Jahren'),
    begrenzung: { staffel: [1500, 3000, 4500, 6000], fuer: ' für Zahnersatz', hinweis: 'Ausschlaggebend ist das jeweilige Behandlungsdatum.' },
    ohneKasse: txt('Um 35 % geringere Erstattung'),
    mindestlaufzeit: txt('2 Jahre, wenn Leistungen in Anspruch genommen wurden. 1 Monat, wenn keine Leistungen in Anspruch genommen wurden.'),
    kuendigung: txt('3 Monate zum Ende eines Kalenderjahres'),
  },
  'Bayerische Beamtenkrankenkasse (BBKK)|ZahnPRIVAT 100': {
    sterne: 4.7, noten: { zahnersatz: 'exzellent', zahnbehandlung: 'exzellent', pzr: 'exzellent' },
    ...GEMEINSAM,
    basisZe: txt('Die angegebenen Erstattungssätze beziehen sich auf den Rechnungsbetrag, Zuzahlungen der Krankenkasse sind enthalten.'),
    basisZb: txt(BASIS_SOFERN),
    pzr: ja('Ohne Begrenzung'),
    kfo: ja('Ohne Zuzahlung Krankenkasse: 100 %, max. 5.000 €\nMit Zuzahlung Krankenkasse: 100 %, max. 5.000 € für die gesamte Vertragslaufzeit'),
    besonderheitenKfo: txt('Erstattung erfolgt, wenn die Behandlung vor dem 19. Geburtstag begonnen wurde.'),
    begrenzung: { staffel: [1000, 3000, 6000] },
    ohneKasse: ja('Voller Umfang enthalten'),
    mindestlaufzeit: txt('2 Jahre'),
    kuendigung: txt('3 Monate zum Ende eines Kalenderjahres'),
  },
};

export const leistungenVon = (gesellschaft, tarif) => LEISTUNGEN[`${gesellschaft}|${tarif}`] || null;

const betrag = (n) => `${n.toLocaleString('de-DE')} €`;

// Staircase as text, with the calendar years counted from the year the insurance starts.
export function begrenzungText({ staffel, fuer = '', hinweis }, startJahr) {
  const n = staffel.length;
  const kopf = `In den ersten ${n} Kalenderjahren (KJ) max. ${betrag(staffel[n - 1])}${fuer}, ab dem ${n + 1}. KJ ohne Begrenzung.`;
  const zeilen = staffel.map((b, i) => `${i === 0 ? '1. KJ' : `1. - ${i + 1}. KJ`}: ${betrag(b)} (${startJahr + i})`);
  return [kopf, '', ...zeilen, ...(hinweis ? ['', hinweis] : [])].join('\n');
}
