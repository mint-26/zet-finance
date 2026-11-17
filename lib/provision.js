// Commission (Abschlussprovision) per insurer, from Marco's "Provisionsübersicht.pdf"
// (Stand 16.11.2026). Used by the CRM tab "Abrechnung". When a rate changes: update it here.
//
// Courtage = provisionsfähiger Monatsbeitrag × mb × faktor. Of that, 10 % stay with Fonds Finanz
// as Stornoreserve; the rest is paid out first. The reserve is no expected cancellation rate.
// zuschlagProvisionsfaehig: false means the surcharge for missing teeth is taken off the premium
// before the commission is worked out (AXA).
//
// Not covered yet, see the PDF: Bestandsprovision amounts, exact cancellation formulas, the
// Allianz rule "ab 65 halbe Courtage" (only flagged, not applied), BBKK Direktanbindung (11 MB)
// and the additional Münchener Verein channel.

import { berechneBeitrag, datumAusIso } from './tarife';

export const PROVISION_STAND = '16.11.2026';

export const PROVISION = {
  Allianz: {
    mb: 7.2, faktor: 1, reserve: 0.1, zuschlagProvisionsfaehig: true,
    haftung: '12 Monate',
    storno: 'Erste drei Monate Vollstorno, danach 1/9-Regelung. Bei Tod keine Stornohaftung.',
    zuschlaege: 'Voll provisionsfähig',
    auszahlung: 'Ca. Ende des Folgemonats nach Policierung oder Nachtrag (Stichtag: vorletzter Werktag des Monats)',
    bestand: 'Ab dem 13. Monat monatlich',
    sonderregel: 'Ab 65 Jahren halbe Courtage (3,60 MB). Genaue Regel noch offen, wird nicht automatisch abgezogen.',
  },
  AXA: {
    mb: 7.2, faktor: 1, reserve: 0.1, zuschlagProvisionsfaehig: false,
    haftung: '12 Monate',
    storno: '1/12-Regelung',
    zuschlaege: 'Nicht provisionsfähig, werden vom Beitrag abgezogen',
    auszahlung: 'Ca. 3 bis 4 Wochen nach Policierung',
    bestand: 'Jährlich im 1. Quartal, rückwirkend für das Vorjahr',
  },
  'Münchener Verein': {
    mb: 7.8, faktor: 1, reserve: 0.1, zuschlagProvisionsfaehig: true,
    haftung: '18 Monate (ZahnGesund)',
    storno: 'Erste drei Monate Vollstorno, danach pro rata',
    zuschlaege: 'Voll provisionsfähig',
    auszahlung: 'Policierung vor dem 10.: ca. Mitte/Ende Folgemonat, danach ca. Mitte/Ende übernächster Monat',
    bestand: 'Ab dem 13. Monat, monatlich im Folgemonat',
  },
  'Württembergische': {
    mb: 7.2, faktor: 1, reserve: 0.1, zuschlagProvisionsfaehig: true,
    haftung: '12 Monate',
    storno: 'Pro rata. Bei Tod keine Stornohaftung.',
    zuschlaege: 'Alle Zuschläge ebenfalls × 7,20 MB',
    auszahlung: 'Ca. Mitte bis Ende des Folgemonats nach Policierung oder Nachtrag',
    bestand: '„Neutral“ (Bedeutung noch offen)',
  },
  'Bayerische Beamtenkrankenkasse (BBKK)': {
    mb: 9.9, faktor: 1, reserve: 0.1, zuschlagProvisionsfaehig: true,
    haftung: '12 Monate',
    storno: 'Konkrete Regel noch nicht übermittelt',
    zuschlaege: 'Voll provisionsfähig',
    auszahlung: 'Mitte bis Ende des Folgemonats nach Policierung oder Nachtrag',
    bestand: 'Jährlich im 1. Quartal (ca. Ende März), rückwirkend; Vertrag am 31.12. im Bestand',
  },
};

// Customers only known from the contract lists (quelle 'bestand') were paid long ago and only
// count for statistics. They are worked out with the rates of Marco's old list: Allianz 6,80 MB,
// Münchener Verein 6,80 MB for contracts starting before February 2026, 7,80 MB from then on.
const ALTE_SAETZE = {
  Allianz: () => 6.8,
  'Münchener Verein': (beginn) => (beginn < '2026-02-01' ? 6.8 : 7.8),
};
const alterSatz = (row) => (row.quelle === 'bestand' && ALTE_SAETZE[row.gesellschaft]
  ? ALTE_SAETZE[row.gesellschaft](String(row.vertragsbeginn || row.created_at || '').slice(0, 10))
  : null);

const runden = (n) => Math.round(n * 100) / 100;
const zahl = (v) => (v == null || v === '' ? null : Number(v));

// Date the premium refers to: the insurance start if set, else closing, else the enquiry.
export const stichtagOf = (row) => datumAusIso(row.vertragsbeginn) || new Date(row.abgeschlossen_am || row.created_at || Date.now());

// Monthly premium of a contract: Marco's value from the old list, else the one saved at closing,
// else worked out from tariff, age and missing teeth. null when unknown (never 0).
export function vertragsBeitrag(row) {
  const alt = zahl(row.monatsbeitrag);
  if (alt != null) return { beitrag: alt, quelle: 'alte Liste' };
  const gespeichert = zahl(row.beitrag_abschluss);
  if (gespeichert != null) return { beitrag: gespeichert, quelle: 'bei Abschluss' };
  const r = berechneBeitrag({ gesellschaft: row.gesellschaft, tarif: row.tarif, geburtsdatum: row.geburtsdatum, fehlendeZaehne: row.fehlende_zaehne }, stichtagOf(row));
  return r.ok ? { beitrag: r.beitrag, quelle: 'berechnet' } : { beitrag: null, quelle: null, grund: r.grund };
}

// Commission of one contract. A commission from Marco's old list (column provision) is a past
// actual value and counts as it is; otherwise it is worked out with the rates above.
export function berechneProvision(row) {
  const regel = PROVISION[row.gesellschaft];
  const { beitrag, quelle, grund } = vertragsBeitrag(row);
  const hinweise = [];
  const alt = zahl(row.provision);

  if (!regel && alt == null) return { ok: false, beitrag, grund: 'Keine Courtagevereinbarung hinterlegt' };

  let basis = beitrag;
  if (regel && !regel.zuschlagProvisionsfaehig && beitrag != null) {
    const r = berechneBeitrag({ gesellschaft: row.gesellschaft, tarif: row.tarif, geburtsdatum: row.geburtsdatum, fehlendeZaehne: row.fehlende_zaehne }, stichtagOf(row));
    if (r.ok && r.zuschlag > 0) {
      basis = runden(beitrag - r.zuschlag);
      hinweise.push(`Risikozuschlag ${r.zuschlag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € nicht provisionsfähig`);
    }
  }

  if (row.gesellschaft === 'Allianz') {
    const jahr = Number(String(row.geburtsdatum || '').match(/(19|20)\d{2}/)?.[0]);
    if (jahr && stichtagOf(row).getFullYear() - jahr >= 65) hinweise.push('Ab 65: halbe Courtage möglich, bitte prüfen');
  }

  if (alt != null) {
    const reserve = runden(alt * 0.1);
    return { ok: true, beitrag, beitragQuelle: quelle, basis, satz: null, courtage: runden(alt), reserve, auszahlung: runden(alt - reserve), quelle: 'alte Liste', hinweise };
  }
  if (basis == null) return { ok: false, beitrag, grund: grund || 'Beitrag fehlt' };

  const alt2 = alterSatz(row);
  const satz = alt2 ?? regel.mb;
  if (alt2 != null) hinweise.push('Vertragsbestand, alter Satz');
  const courtage = runden(basis * satz * regel.faktor);
  const reserve = runden(courtage * regel.reserve);
  return { ok: true, beitrag, beitragQuelle: quelle, basis, satz, courtage, reserve, auszahlung: runden(courtage - reserve), quelle: 'berechnet', hinweise };
}
