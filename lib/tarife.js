// Tariffs, monthly premiums and risk surcharges of Marco's five focus insurers, from
// "Tarife_Beitraege_Risikozuschlaege_5_Gesellschaften_aktualisiert.pdf" (Erfassungsstand
// 13.11.2026). Used by the CRM for the fields Tarif, Beitrag and Altersbedingte Erhöhung.
// When an insurer changes its prices: update the numbers here, nothing else.
//
// alter: first age of each age band, in order; every beitrag list follows these bands.
// Tariff age = calendar year minus year of birth, so a new band applies from 1 January of the
// year in which the customer reaches it, even with a birthday in the middle of the year.
// A tariff without beitrag is selectable, but has no premium table yet.
//
// zuschlag (missing teeth), per tariff:
//   { art: 'prozent', proZahn: 0.25 }    premium × (1 + 25 % per tooth)
//   { art: 'euroJeZahn', beitrag: [...] } euros per tooth, by age band
//   { art: 'gesamt', betrag: { 1, 2, 3 } } total euros for that number of teeth
//   none: no surcharge stated, so none is charged.
// maxZaehne: from this number plus one, no contract is possible.

export const TARIF_STAND = '13.11.2026';

export const FOKUS = {
  Allianz: {
    alter: [0, 21, 31, 41, 51, 61],
    maxZaehne: 3,
    preisstand: 'nicht angegeben',
    tarife: [
      { name: 'MeinZahnschutz 75', kennung: 'ZS75', beitrag: [8.43, 12.94, 17.39, 21.55, 27.10, 30.64], zuschlag: { art: 'prozent', proZahn: 0.25 } },
      { name: 'MeinZahnschutz 90', kennung: 'ZS90', beitrag: [13.15, 15.89, 23.58, 31.56, 41.89, 48.04], zuschlag: { art: 'prozent', proZahn: 0.25 } },
      { name: 'MeinZahnschutz 100', kennung: 'ZS100', beitrag: [17.47, 18.77, 29.88, 41.73, 56.93, 65.63], zuschlag: { art: 'prozent', proZahn: 0.25 } },
      { name: 'MeinZahnschutz 75 mit AR', kennung: 'ZS75AR' },
      { name: 'MeinZahnschutz 90 mit AR', kennung: 'ZS90AR' },
      { name: 'MeinZahnschutz 100 mit AR', kennung: 'ZS100AR' },
    ],
  },
  AXA: {
    alter: [0, 21, 26, 31, 36, 41, 46, 51, 56, 61],
    preisstand: 'nicht angegeben',
    tarife: [
      { name: 'Zahn Premium', beitrag: [17.15, 14.43, 18.08, 26.15, 33.34, 40.02, 44.62, 52.44, 59.86, 72.68] },
      { name: 'Zahn Komfort', beitrag: [15.63, 12.40, 15.53, 22.33, 28.51, 34.24, 38.21, 44.85, 51.27, 62.53] },
      { name: 'Zahn Klassik', beitrag: [9.18, 7.05, 8.74, 12.14, 15.35, 18.19, 20.25, 23.22, 26.06, 31.92] },
      { name: 'Zahn easy', beitrag: [14.57, 14.57, 14.57, 14.57, 14.57, 28.03, 28.03, 28.03, 28.03, 28.03] },
    ],
  },
  'Münchener Verein': {
    alter: [0, 6, 16, 26, 31, 36, 41, 46, 51, 56, 61],
    preisstand: 'nicht angegeben',
    tarife: [
      { name: 'ZahnGesund 75+', kennung: '577', beitrag: [1.00, 2.00, 7.90, 15.90, 15.90, 18.90, 19.90, 19.90, 25.90, 29.90, 37.90] },
      { name: 'ZahnGesund 85+', kennung: '578', beitrag: [1.10, 3.00, 12.90, 21.90, 21.90, 28.90, 30.90, 32.90, 41.90, 48.90, 65.90] },
      { name: 'ZahnGesund 100', kennung: '579', beitrag: [1.50, 17.90, 21.90, 28.90, 37.90, 44.90, 44.90, 55.90, 66.90, 75.90, 109.90] },
    ],
  },
  'Württembergische': {
    alter: [0, 21, 31, 41, 51, 61],
    maxZaehne: 3,
    preisstand: 'nicht angegeben, Zuschläge Eurotabelle 05/2022',
    tarife: [
      { name: 'ZahnSchutz Kompakt', kennung: 'ZZ75 + ZZB', beitrag: [10.68, 10.75, 13.73, 17.56, 22.85, 25.87], zuschlag: { art: 'euroJeZahn', beitrag: [0.27, 0.72, 1.46, 2.42, 3.74, 4.50] } },
      { name: 'ZahnSchutz Komfort', kennung: 'ZZ90 + ZZB', beitrag: [13.16, 15.34, 21.45, 28.53, 36.74, 42.90], zuschlag: { art: 'euroJeZahn', beitrag: [0.89, 1.87, 3.39, 5.16, 7.22, 8.76] } },
      { name: 'ZahnSchutz Premium', kennung: 'ZZ100 + ZZBPlus', beitrag: [29.51, 23.89, 33.19, 43.93, 56.47, 65.91], zuschlag: { art: 'euroJeZahn', beitrag: [1.30, 2.75, 4.99, 7.59, 10.61, 12.88] } },
      { name: 'Zahn & Brille', kennung: 'Kombiprodukt' },
    ],
  },
  'Bayerische Beamtenkrankenkasse (BBKK)': {
    alter: [0, 20, 30, 40, 50, 60],
    maxZaehne: 3,
    preisstand: '01.08.2024',
    tarife: [
      { name: 'ZahnPRIVAT 75', beitrag: [0.99, 8.00, 11.70, 16.91, 25.23, 35.37], zuschlag: { art: 'gesamt', betrag: { 1: 6.10, 2: 12.20, 3: 18.30 } } },
      { name: 'ZahnPRIVAT 90', beitrag: [17.16, 16.94, 22.77, 34.46, 45.89, 66.91], zuschlag: { art: 'gesamt', betrag: { 1: 9.00, 2: 18.00, 3: 27.00 } } },
      { name: 'ZahnPRIVAT 100', beitrag: [20.73, 21.55, 30.05, 45.69, 59.31, 84.14], zuschlag: { art: 'gesamt', betrag: { 1: 10.90, 2: 21.80, 3: 32.70 } } },
      { name: 'AOK-ZahnPRIVAT 75' },
      { name: 'AOK-ZahnPRIVAT 90' },
      { name: 'AOK-ZahnPRIVAT 100' },
    ],
  },
};

export const istFokus = (gesellschaft) => !!FOKUS[gesellschaft];
export const fokusTarife = (gesellschaft) => (FOKUS[gesellschaft]?.tarife || []).map((t) => t.name);

const runden = (n) => Math.round(n * 100) / 100;

// Year of birth from the stored text: ISO (1990-05-01) or older German dates (01.05.1990).
export function geburtsjahr(geburtsdatum) {
  const m = String(geburtsdatum || '').match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

// Missing teeth as a number; "4+" counts as 4.
export function zaehneAnzahl(fehlendeZaehne) {
  const n = parseInt(String(fehlendeZaehne || '0'), 10);
  return Number.isFinite(n) ? n : 0;
}

const band = (gesellschaft, alter) => {
  let i = 0;
  gesellschaft.alter.forEach((start, idx) => { if (alter >= start) i = idx; });
  return i;
};

// Monthly premium in one age band, with the surcharge for missing teeth.
function beitragImBand(tarif, i, zaehne) {
  const grund = tarif.beitrag[i];
  const z = tarif.zuschlag;
  let zuschlag = 0;
  if (zaehne > 0 && z) {
    if (z.art === 'prozent') zuschlag = grund * z.proZahn * zaehne;
    if (z.art === 'euroJeZahn') zuschlag = z.beitrag[i] * zaehne;
    if (z.art === 'gesamt') zuschlag = z.betrag[zaehne] || 0;
  }
  return { grund, zuschlag: runden(zuschlag), beitrag: runden(grund + zuschlag) };
}

// Premium today plus the next age-related change. Returns { ok: false, grund } when it cannot
// be worked out, with the reason in German for the CRM.
export function berechneBeitrag({ gesellschaft, tarif, geburtsdatum, fehlendeZaehne }, heute = new Date()) {
  const g = FOKUS[gesellschaft];
  if (!gesellschaft) return { ok: false, grund: 'Erst Gesellschaft wählen' };
  if (!g) return { ok: false, grund: 'Keine Beitragstabelle hinterlegt' };
  const t = g.tarife.find((x) => x.name === tarif);
  if (!t) return { ok: false, grund: tarif ? 'Tarif nicht in der Liste' : 'Erst Tarif wählen' };
  if (!t.beitrag) return { ok: false, grund: 'Für diesen Tarif fehlt die Beitragstabelle' };
  const jahr = geburtsjahr(geburtsdatum);
  if (!jahr) return { ok: false, grund: 'Geburtsdatum fehlt' };
  const zaehne = zaehneAnzahl(fehlendeZaehne);
  if (g.maxZaehne != null && zaehne > g.maxZaehne) {
    return { ok: false, grund: `Ab ${g.maxZaehne + 1} fehlenden Zähnen kein Abschluss möglich` };
  }

  const alter = heute.getFullYear() - jahr;
  const i = band(g, alter);
  const jetzt = beitragImBand(t, i, zaehne);

  // The next band whose premium differs; bands with the same price are skipped.
  let naechste = null;
  for (let j = i + 1; j < g.alter.length; j += 1) {
    const dann = beitragImBand(t, j, zaehne);
    if (dann.beitrag !== jetzt.beitrag) {
      const abAlter = g.alter[j];
      naechste = { abAlter, ab: new Date(jahr + abAlter, 0, 1), beitrag: dann.beitrag, mehr: runden(dann.beitrag - jetzt.beitrag) };
      break;
    }
  }

  return {
    ok: true, alter, zaehne, ...jetzt, naechste,
    ohneZuschlagstabelle: zaehne > 0 && !t.zuschlag,
    preisstand: g.preisstand,
  };
}

export const euro = (n) => `${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
