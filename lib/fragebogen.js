// Answer options of the Zahnzusatz questionnaire, in one place for the form
// (components/Questionnaire.js), the CRM's "Kundenangaben bearbeiten" and the server check
// (app/api/submissions/[id]/route.js). A value Marco picks in the CRM is always one the form
// could have sent. Values are stored in German and are never translated.

import { GKV } from './insurers';

// Health insurance answers. kind decides the follow-up: gkv/pkv show the matching
// insurer list, none shows nothing further.
export const KV = {
  pflicht: { value: 'gesetzlich pflichtversichert', kind: 'gkv' },
  freiwillig: { value: 'gesetzlich freiwillig versichert', kind: 'gkv' },
  familie: { value: 'gesetzlich familienversichert', kind: 'gkv' },
  privat: { value: 'privat versichert', kind: 'pkv' },
  heilfuersorge: { value: 'über freie Heilfürsorge abgesichert', kind: 'none' },
};
export const KV_BY_VALUE = Object.fromEntries(Object.values(KV).map((k) => [k.value, k]));

// Insurance types offered per employment status.
export const ERWERBSSTATUS = [
  { value: 'Angestellt', kv: [KV.pflicht, KV.freiwillig, KV.familie, KV.privat] },
  { value: 'Selbstständig / freiberuflich', kv: [KV.freiwillig, KV.pflicht, KV.privat] },
  { value: 'Verbeamtet', kv: [KV.privat, KV.freiwillig, KV.heilfuersorge] },
  { value: 'In Ausbildung / im Studium', kv: [KV.pflicht, KV.familie, KV.freiwillig, KV.privat] },
  { value: 'Im Ruhestand', kv: [KV.pflicht, KV.freiwillig, KV.privat] },
  { value: 'Derzeit nicht erwerbstätig', kv: [KV.pflicht, KV.freiwillig, KV.familie, KV.privat] },
  { value: 'Sonstiges', kv: [KV.pflicht, KV.freiwillig, KV.familie, KV.privat] },
];
export const kvOptions = (status) => ERWERBSSTATUS.find((e) => e.value === status)?.kv || [];

export const WANTS_MAIL = 'Per E-Mail';
export const WANTS_PHONE = 'Telefonisch';
export const WANTS_WHATSAPP = 'Per WhatsApp';

export const JA_NEIN = ['Ja', 'Nein'];
export const BEHANDLUNG = [
  { value: 'Ja, bereits dokumentiert', label: 'Ja, wurde bereits in der Krankenakte oder Heil- und Kostenplan dokumentiert' },
  { value: 'Ja, nur kommuniziert', label: 'Ja, wurde bislang nur kommuniziert und noch nicht dokumentiert' },
  { value: 'Nein', label: 'Nein' },
];
export const FEHLENDE_ZAEHNE = ['0', '1', '2', '3', '4', '4+'];
export const PARODONTOSE = [
  { value: 'Ja, aktuell in Behandlung', label: 'Ja, ist aktuell noch in Behandlung oder wurde vor Vertragsbeginn festgestellt' },
  { value: 'Ja, ausgeheilt', label: 'Ja, ist bereits vollständig ausgeheilt und behandelt worden' },
  { value: 'Nein', label: 'Nein' },
];
export const SCHWERPUNKT = [
  'Zahnersatz',
  'Zahnbehandlung',
  'Kieferorthopädie',
  'Kosmetische Eingriffe (Zahnreinigung, Bleaching etc.)',
];
export const BEIHILFE = ['Ja', 'Nein', 'Weiß ich nicht'];
export const WECHSEL = ['Ja, ich hätte gerne ein Vergleichsangebot', 'Nein'];
export const GESCHLECHT = ['Männlich', 'Weiblich', 'Divers'];
export const FAMILIENSTAND = ['Ledig', 'Verheiratet', 'Verpartnert (in einem Haushalt lebend)', 'Geschieden', 'Verwitwet'];
export const KONTAKTWEG = [WANTS_MAIL, WANTS_PHONE, WANTS_WHATSAPP];

const values = (list) => list.map((o) => (typeof o === 'string' ? o : o.value));

// Table column → allowed values. multi: comma-joined list of several answers.
export const ANTWORT_FELDER = {
  behandlung: { options: values(BEHANDLUNG) },
  heilkostenplan: { options: JA_NEIN },
  fehlende_zaehne: { options: FEHLENDE_ZAEHNE },
  zahnluecke: { options: JA_NEIN },
  parodontose: { options: values(PARODONTOSE) },
  schwerpunkt: { options: SCHWERPUNKT, multi: true },
  vorherige_versicherung: { options: JA_NEIN },
  erwerbsstatus: { options: values(ERWERBSSTATUS) },
  beihilfe: { options: BEIHILFE },
  versicherungsart: { options: Object.values(KV).map((k) => k.value) },
  wechsel: { options: WECHSEL },
  bonusprogramm: { options: JA_NEIN },
  geschlecht: { options: GESCHLECHT },
  familienstand: { options: FAMILIENSTAND },
  kontaktweg: { options: KONTAKTWEG, multi: true },
};

// Split a comma-joined multi-select value into individual items,
// respecting parentheses so e.g. "foo (a, b), bar" stays two items.
export function splitMulti(value) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of String(value || '')) {
    if (ch === '(') { depth++; current += ch; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); current += ch; continue; }
    if (ch === ',' && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export const NICHT_IN_LISTE = ' (nicht in der Liste)';

// The insurer as one readable text, as the CRM shows it: statutory funds carry the total
// contribution rate, a name typed by hand is marked as such.
export function krankenkasseText({ kind, kasse, istAndere, freitext }) {
  if (istAndere) return freitext.trim() ? `${freitext.trim()}${NICHT_IN_LISTE}` : '';
  if (kind === 'gkv') {
    const entry = GKV.find((k) => k.name === kasse);
    return entry?.rate ? `${entry.name} (${entry.rate} %)` : kasse;
  }
  return kind === 'pkv' ? kasse : '';
}
