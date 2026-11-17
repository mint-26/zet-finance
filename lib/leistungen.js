// Benefits per tariff for the offer comparison (CRM "Angebot erstellen"). Source since 17.11.2026:
// Marco's "Zahnzusatz_Leistungsdatenbank_5_Tarife_Vollbedingungen" (taken from the original tariff
// conditions); where it says nothing, the values of his Canva offer "ZZV 100%" stay (star ratings,
// grades, minimum term and notice of Allianz and BBKK). A tariff without an entry shows "Angaben
// folgen". New tariffs: add an entry with the same keys.
//
// A cell is { s, t }: s = 'ja' (tick), 'nein' (red mark) or undefined (plain text), t = text.
// Line breaks in t stay. Leistungsbegrenzung is a staircase of cumulative maximums per year:
// periode 'VJ' counts insurance years from the start, 'KJ' calendar years (the first one ends on
// 31 December). The CRM writes the dates itself from the insurance start.

export const LEISTUNGEN_STAND = '17.11.2026';
// Where the star ratings come from, printed under the offer. Marco to confirm the exact source.
export const BEWERTUNG_QUELLE = 'Kundenbewertungen laut Vergleichsunterlagen von Marco Arpa, Stand 16.11.2026';

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
const GOZ = txt('Bis zum Höchstsatz der GOZ (3,5-fach)');
const GOZ_UEBER = txt('Auch über den Höchstsatz der GOZ, bei Honorarvereinbarung nach § 2 GOZ');
const BASIS = 'Der Erstattungssatz von 100 % bezieht sich auf den Rechnungsbetrag, Zuzahlungen der Krankenkasse sind enthalten.';
const BASIS_SOFERN = 'Der Erstattungssatz von 100 % bezieht sich auf den Rechnungsbetrag, Zuzahlungen der Krankenkasse sind enthalten, sofern nicht anders gekennzeichnet.';
const ALLES_100 = Object.fromEntries(['kronen', 'implantate', 'inlays', 'veneers', 'knochenaufbau', 'labor', 'funktionsdiagnostik', 'schleimhautZe', 'fuellungen', 'wurzel', 'paro', 'fissuren', 'schleimhautZb'].map((k) => [k, HUNDERT]));
const WARTEZEITEN = { wartezeitZe: OHNE_WZ, wartezeitZb: OHNE_WZ, wartezeitPzr: OHNE_WZ, wartezeitKfo: OHNE_WZ, wartezeit: OHNE_WZ };
const NOTEN = { zahnersatz: 'exzellent', zahnbehandlung: 'exzellent', pzr: 'exzellent' };
const BEHANDLUNGSDATUM = 'Ausschlaggebend ist das jeweilige Behandlungsdatum. Unfälle sind von der Begrenzung ausgenommen.';

// Keyed "Gesellschaft|Tarif", with the names used in lib/tarife.js.
export const LEISTUNGEN = {
  'Allianz|MeinZahnschutz 100': {
    sterne: 4.2, noten: NOTEN,
    ...ALLES_100, ...WARTEZEITEN, gozZe: GOZ, gozZb: GOZ,
    basisZe: txt(BASIS), basisZb: txt(BASIS),
    pzr: ja('Ohne eigenes Jahreslimit, zählt in den ersten 3 Versicherungsjahren zur Leistungsbegrenzung'),
    kfo: ja('100 %, max. 3.000 € insgesamt'),
    besonderheitenKfo: txt('Behandlung vor dem 21. Geburtstag; danach nur nach Unfall oder bestimmten schweren Erkrankungen'),
    bleaching: ja('150 € alle 2 Versicherungsjahre'),
    narkose: ja('100 %, wie die zugehörige Behandlung'),
    vorversicherung: nein('Nur bei Wechsel aus einem Allianz-Zahntarif'),
    begrenzung: { staffel: [1000, 2500, 4000], periode: 'VJ', fuer: ', inklusive Zahnreinigung und Bleaching', hinweis: BEHANDLUNGSDATUM },
    ohneKasse: txt('Beim inländischen Privatzahnarzt ohne Kassenzulassung werden 75 % erstattet, im Ausland gilt keine Kürzung.'),
    mindestlaufzeit: txt('2 Jahre, das erste Versicherungsjahr endet am 31. Dezember des betreffenden Kalenderjahres.'),
    kuendigung: txt('1 Monat zum Ende eines Kalenderjahres'),
  },
  'Münchener Verein|ZahnGesund 100': {
    sterne: 4.3, noten: NOTEN,
    ...ALLES_100, ...WARTEZEITEN, gozZe: GOZ, gozZb: GOZ,
    basisZe: txt('100 % inklusive Krankenkasse. Zahlt die Krankenkasse nicht, werden 35 % als fiktive Kassenleistung abgezogen.'),
    basisZb: txt(BASIS),
    pzr: ja('2 x 100 € pro Versicherungsjahr, außerhalb der Leistungsbegrenzung'),
    kfo: ja('Ohne Zuzahlung Krankenkasse: 65 %, max. 5.000 €\nMit Zuzahlung Krankenkasse: 100 %, max. 5.000 € für die gesamte Vertragslaufzeit'),
    besonderheitenKfo: txt('Behandlungsbeginn bis zum 18. Geburtstag; danach max. 2.500 €'),
    bleaching: ja('200 € alle 2 Versicherungsjahre'),
    narkose: ja('Bis 300 € pro Versicherungsjahr'),
    vorversicherung: ja('Vorversicherung mit mind. 90 % Zahnersatz und 12 Monaten verkürzt die Leistungsbegrenzung, ab 4 Jahren entfällt sie'),
    begrenzung: { staffel: [1500, 3000, 4500, 6000], periode: 'VJ', hinweis: BEHANDLUNGSDATUM },
    ohneKasse: txt('Zahlt die Krankenkasse bei Zahnersatz oder Kieferorthopädie nicht, werden 35 % als fiktive Kassenleistung abgezogen.'),
    mindestlaufzeit: txt('24 Monate'),
    kuendigung: txt('3 Monate zum Ende des Versicherungsjahres'),
  },
  'Bayerische Beamtenkrankenkasse (BBKK)|ZahnPRIVAT 100': {
    sterne: 4.7, noten: NOTEN,
    ...ALLES_100, ...WARTEZEITEN, gozZe: GOZ, gozZb: GOZ,
    basisZe: txt('Die angegebenen Erstattungssätze beziehen sich auf den Rechnungsbetrag, Zuzahlungen der Krankenkasse sind enthalten.'),
    basisZb: txt(BASIS_SOFERN),
    pzr: ja('Ohne Begrenzung, außerhalb der Leistungsbegrenzung'),
    kfo: ja('100 %, max. 5.000 € für die gesamte Vertragslaufzeit'),
    besonderheitenKfo: txt('Behandlungsbeginn vor dem 19. Geburtstag; danach nur nach Unfall oder mit Kassenleistung'),
    bleaching: ja('200 € alle 2 Kalenderjahre'),
    narkose: ja('100 %, bei versicherten Behandlungen'),
    vorversicherung: nein(),
    begrenzung: { staffel: [1000, 3000, 6000], periode: 'KJ', fuer: ' inklusive Kieferorthopädie', hinweis: BEHANDLUNGSDATUM },
    ohneKasse: ja('Voller Umfang enthalten'),
    mindestlaufzeit: txt('2 Jahre'),
    kuendigung: txt('3 Monate zum Ende eines Kalenderjahres'),
  },
  'AXA|Zahn Premium': {
    ...ALLES_100, ...WARTEZEITEN, gozZe: GOZ_UEBER, gozZb: GOZ_UEBER,
    basisZe: txt('100 % inklusive Krankenkasse, wenn die Kasse zum Befund leistet; sonst 60 %.'),
    basisZb: txt('Füllungen wie Zahnersatz (100 % bzw. 60 % ohne Kassenleistung), übrige Behandlungen 100 %.'),
    pzr: ja('Ohne eigenes Budget, außerhalb der Leistungsbegrenzung'),
    kfo: ja('100 %, max. 5.000 € für die gesamte Vertragslaufzeit'),
    besonderheitenKfo: txt('Behandlungsbeginn vor dem 18. Geburtstag; eigene Anfangsgrenze 500 € im 1., 1.000 € in den ersten 2 Versicherungsjahren'),
    bleaching: ja('200 € alle 2 Versicherungsjahre'),
    narkose: ja('Bis 500 € pro Versicherungsjahr'),
    vorversicherung: ja('Bei nahtloser Vorversicherung (mind. 80 % Zahnersatz, 6 Monate) nur 2 Jahre Leistungsbegrenzung'),
    begrenzung: { staffel: [1500, 3000, 4500, 6000], periode: 'VJ', hinweis: BEHANDLUNGSDATUM },
    ohneKasse: txt('Ohne Kassenleistung zum Befund werden Zahnersatz und Füllungen zu 60 % erstattet; beim Zahnarzt ohne Kassenzulassung gilt für Behandlung und Kieferorthopädie ein fiktiver Kassenanteil von 40 %.'),
    mindestlaufzeit: txt('Keine; nach einem Leistungsfall in den ersten 2 Jahren 2 Versicherungsjahre'),
    kuendigung: txt('Zum Monatsende mit 15 Tagen Frist'),
  },
  'Württembergische|ZahnSchutz Premium': {
    ...WARTEZEITEN, gozZe: GOZ_UEBER, gozZb: GOZ_UEBER,
    kronen: HUNDERT, implantate: HUNDERT, inlays: HUNDERT, veneers: HUNDERT, knochenaufbau: HUNDERT, labor: HUNDERT, funktionsdiagnostik: HUNDERT,
    fuellungen: HUNDERT, wurzel: HUNDERT, paro: ja('100 % (ohne GTR/GBR)'),
    basisZe: txt('100 % inklusive Krankenkasse. Ohne Kassenleistung werden 30 % fiktiv abgezogen (25 % mit Kooperationslabor).'),
    basisZb: txt('100 % inklusive Krankenkasse; ohne Kassenleistung im Ausland oder beim Privatzahnarzt 50 %.'),
    pzr: ja('150 € pro Versicherungsjahr'),
    kfo: ja('100 %, max. 3.000 € für die gesamte Vertragslaufzeit'),
    besonderheitenKfo: txt('Behandlungsbeginn vor dem 18. Geburtstag; eigene Anfangsgrenze 600 / 1.200 / 1.800 € in den ersten 3 Jahren'),
    bleaching: nein('Nicht belegt'),
    narkose: ja('Bis 200 € pro Versicherungsjahr'),
    begrenzung: { staffel: [1500, 3000, 4500, 6000], periode: 'KJ', fuer: ' für Zahnersatz', hinweis: BEHANDLUNGSDATUM },
    ohneKasse: txt('Ohne Kassenleistung werden beim Zahnersatz 30 % fiktiv abgezogen, Zahnbehandlungen werden zu 50 % erstattet.'),
  },
};

export const leistungenVon = (gesellschaft, tarif) => LEISTUNGEN[`${gesellschaft}|${tarif}`] || null;

const betrag = (n) => `${n.toLocaleString('de-DE')} €`;
const datum = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

// End of year i (0-based) of the staircase and the date it no longer applies.
function jahresende({ periode = 'KJ' }, beginn, i) {
  return periode === 'VJ'
    ? new Date(beginn.getFullYear() + i + 1, beginn.getMonth(), beginn.getDate() - 1)
    : new Date(beginn.getFullYear() + i, 11, 31);
}
export function begrenzungEnde(wert, beginn) {
  const ende = jahresende(wert, beginn, wert.staffel.length - 1);
  return new Date(ende.getFullYear(), ende.getMonth(), ende.getDate() + 1);
}

// Staircase as text, with the years counted from the insurance start.
export function begrenzungText(wert, beginn) {
  const { staffel, periode = 'KJ', fuer = '', hinweis } = wert;
  const n = staffel.length;
  const art = periode === 'VJ' ? 'Versicherungsjahren (VJ)' : 'Kalenderjahren (KJ)';
  const kopf = `In den ersten ${n} ${art} max. ${betrag(staffel[n - 1])}${fuer}, ab ${datum(begrenzungEnde(wert, beginn))} ohne Begrenzung.`;
  const zeilen = staffel.map((b, i) => `${i === 0 ? `1. ${periode}` : `1. - ${i + 1}. ${periode}`}: ${betrag(b)} (bis ${datum(jahresende(wert, beginn, i))})`);
  return [kopf, '', ...zeilen, ...(hinweis ? ['', hinweis] : [])].join('\n');
}

// The few facts on each offer card (and in the offer e-mail): what a customer compares first.
export function kurzfakten(l, beginn) {
  if (!l) return [{ s: undefined, t: 'Leistungsangaben folgen' }];
  const erste = (v) => (v?.t || '').split('\n')[0];
  const fakten = [
    { s: l.kronen?.s, t: `Zahnersatz ${erste(l.kronen)}` },
    { s: l.fuellungen?.s, t: `Zahnbehandlung ${erste(l.fuellungen)}` },
    { s: l.pzr?.s, t: `Zahnreinigung: ${erste(l.pzr).split(',')[0]}` },
    { s: l.kfo?.s, t: `Kieferorthopädie Kinder: ${erste(l.kfo).replace('Ohne Zuzahlung Krankenkasse: ', '')}` },
    { s: l.wartezeit?.t === 'Ohne Wartezeit' ? 'ja' : undefined, t: l.wartezeit?.t || '' },
  ];
  if (l.begrenzung?.staffel) {
    const st = l.begrenzung.staffel;
    fakten.push({ s: undefined, t: `Anfangs begrenzt: bis ${betrag(st[st.length - 1])} in ${st.length} Jahren, ab ${datum(begrenzungEnde(l.begrenzung, beginn))} unbegrenzt` });
  }
  return fakten.filter((f) => f.t);
}
