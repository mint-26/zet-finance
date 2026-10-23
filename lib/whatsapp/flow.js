// Dialogue of the WhatsApp bot. Pure logic without I/O: takes the stored
// conversation and one incoming message, returns the next conversation state
// and the replies. Questions and answer values mirror components/Questionnaire.js,
// so a WhatsApp lead lands in the CRM exactly like a web lead.
//
// Replies are provider-neutral: { text, buttons?: [{ id, title }],
// list?: [{ id, title, description? }] }. lib/whatsapp/api.js turns them into
// WhatsApp messages. WhatsApp limits: 3 buttons with 20 characters, 10 list
// rows with 24 characters title and 72 characters description.

import { SITE_URL } from '../site';

// States in which the bot stays silent unless the lead taps the website link again.
export const SILENT_STATES = ['idle', 'done', 'cancelled', 'manual'];
export const FIRST_STEP = 'start';

const PRIVACY_URL = `${SITE_URL}/datenschutz`;

const opts = (...values) => values.map((v) => (typeof v === 'string' ? { value: v, title: v } : v));
const YES_NO = opts('Ja', 'Nein');

const MULTI_HINT = 'Bitte antworten Sie mit den Nummern, z. B. „1, 3“.';

// Each step asks one question and stores the answer under `field`.
// type: choice (buttons or list), multi (numbered list, several answers), text.
// next: key of the following step (default: next entry), or a function of the value.
// complete: the step finishes the dialogue and saves the lead.
const STEPS = [
  {
    key: 'start', type: 'choice', field: '_weg',
    text: 'Hallo und danke für Ihre Nachricht! Ich bin der digitale Assistent von Marco Arpa, Ihrem unabhängigen Versicherungsmakler.\n\nWorum geht es Ihnen?',
    options: [
      { value: 'zahnzusatz', title: 'Zahnzusatz-Angebot' },
      { value: 'gespraech', title: 'Gespräch mit Marco' },
    ],
    next: (v) => (v === 'zahnzusatz' ? 'datenschutz' : 'g_name'),
  },

  // ─── Zahnzusatz ───
  {
    key: 'datenschutz', type: 'choice', field: 'datenschutz',
    text: '*Zahnzusatzversicherung*\nIch stelle Ihnen jetzt die Fragen aus dem Angebotsformular, das dauert etwa fünf Minuten. Mit „zurück“ ändern Sie Ihre letzte Antwort, mit „abbrechen“ beenden Sie das Gespräch.\n\n'
      + 'Zuerst Ihre Einwilligung: Ich willige in die Verarbeitung meiner personenbezogenen Daten einschließlich meiner Gesundheitsdaten (Angaben zum Zahnzustand) zur Erstellung eines Versicherungsangebots ein.\n'
      + `Details: ${PRIVACY_URL}`,
    options: [
      { value: true, title: 'Ja, einverstanden' },
      { value: false, title: 'Nein' },
    ],
    next: (v) => (v ? 'name' : 'datenschutz_nein'),
  },
  {
    key: 'datenschutz_nein', type: 'choice', field: '_nachEinwilligung',
    text: 'Ohne Ihre Einwilligung kann ich keine Angaben aufnehmen. Möchten Sie stattdessen ein persönliches Gespräch mit Marco?',
    options: [
      { value: 'gespraech', title: 'Gespräch mit Marco' },
      { value: 'abbrechen', title: 'Abbrechen' },
    ],
    next: (v) => (v === 'gespraech' ? 'g_name' : 'cancel'),
  },
  {
    key: 'name', type: 'text', field: 'name',
    text: '*1/4 Persönliche Angaben*\nWie lautet Ihr Vor- und Nachname?',
    validate: (t) => (t.length >= 3 && t.includes(' ') ? null : 'Bitte geben Sie Vor- und Nachnamen an.'),
  },
  {
    key: 'anschrift', type: 'text', field: 'anschrift',
    text: 'Ihre vollständige Anschrift, bitte in dieser Reihenfolge: Postleitzahl, Ort, Straße, Hausnummer.\nZum Beispiel: 60311 Frankfurt am Main, Musterstraße 1',
    validate: (t) => (/\d/.test(t) && t.length >= 10 ? null : 'Bitte geben Sie die vollständige Anschrift mit Postleitzahl und Hausnummer an.'),
  },
  {
    key: 'geburtsdatum', type: 'text', field: 'geburtsdatum',
    text: 'Ihr Geburtsdatum? (TT.MM.JJJJ, z. B. 14.03.1985)',
    parse: parseBirthdate,
  },
  {
    key: 'geschlecht', type: 'choice', field: 'geschlecht',
    text: 'Ihr Geschlecht?',
    options: opts('Männlich', 'Weiblich', 'Divers'),
  },
  {
    key: 'familienstand', type: 'choice', field: 'familienstand',
    text: 'Ihr Familienstand?',
    options: opts('Ledig', 'Verheiratet',
      { value: 'Verpartnert (in einem Haushalt lebend)', title: 'Verpartnert', description: 'in einem Haushalt lebend' },
      'Geschieden', 'Verwitwet'),
  },
  {
    key: 'telefon', type: 'custom', field: 'telefon',
    ask: (data, ctx) => ({
      text: `Unter welcher Nummer darf Marco Sie zurückrufen? Ist es diese: ${formatWaId(ctx.waId)}?`,
      buttons: [{ id: 'opt:0', title: 'Ja, diese Nummer' }, { id: 'opt:1', title: 'Andere Nummer' }],
    }),
    handle: (input, data, ctx) => {
      if (input.id === 'opt:0' || /^ja\b/i.test(input.text)) return { value: formatWaId(ctx.waId), next: 'email' };
      if (input.id === 'opt:1' || /^(andere|nein)\b/i.test(input.text)) return { value: undefined, next: 'telefon_andere' };
      const phone = parsePhone(input.text);
      if (phone) return { value: phone, next: 'email' };
      return { error: 'Bitte tippen Sie auf einen der Knöpfe oder schreiben Sie die Rückrufnummer.' };
    },
  },
  {
    key: 'telefon_andere', type: 'text', field: 'telefon',
    text: 'Unter welcher Nummer erreicht Marco Sie?',
    parse: (t) => {
      const phone = parsePhone(t);
      return phone ? { value: phone } : { error: 'Das sieht nicht nach einer Telefonnummer aus. Bitte noch einmal, z. B. +49 170 1234567.' };
    },
    next: 'email',
  },
  {
    key: 'email', type: 'text', field: 'email',
    text: 'Ihre E-Mail-Adresse?',
    parse: (t) => {
      const email = t.replace(/\s/g, '');
      return /^[^@]+@[^@]+\.[a-z]{2,}$/i.test(email) ? { value: email } : { error: 'Bitte prüfen Sie die E-Mail-Adresse.' };
    },
  },
  {
    key: 'beruf', type: 'text', field: 'beruf', optional: true,
    text: 'Ihr Beruf? (freiwillig)',
  },

  {
    key: 'versicherungsart', type: 'choice', field: 'versicherungsart',
    text: '*2/4 Krankenversicherung*\nWie sind Sie krankenversichert?',
    options: [
      { value: 'gesetzlich pflichtversichert', title: 'Gesetzlich pflicht', description: 'gesetzlich pflichtversichert' },
      { value: 'gesetzlich freiwilligversichert', title: 'Gesetzlich freiwillig', description: 'gesetzlich freiwillig versichert' },
      { value: 'gesetzlich familienversichert', title: 'Gesetzlich familien', description: 'gesetzlich familienversichert' },
      { value: 'privatversichert', title: 'Privat versichert' },
    ],
  },
  {
    key: 'krankenkasse', type: 'text', field: 'krankenkasse',
    text: 'Bei welcher Krankenkasse sind Sie? (z. B. AOK, TK, Barmer)',
  },
  {
    key: 'wechsel', type: 'choice', field: 'wechsel',
    text: 'Kommt ein Wechsel der Krankenkasse in Frage, wenn sich Preis und/oder Leistung dadurch verbessern?',
    options: [
      { value: 'Ja, ich hätte gerne ein Vergleichsangebot', title: 'Ja, gern Vergleich' },
      { value: 'Nein', title: 'Nein' },
    ],
  },
  {
    key: 'bonusprogramm', type: 'choice', field: 'bonusprogramm',
    text: 'Nehmen Sie aktuell an einem Bonusprogramm Ihrer Krankenkasse teil?',
    options: YES_NO,
  },

  {
    key: 'behandlung', type: 'choice', field: 'behandlung',
    text: '*3/4 Zahnstatus*\nErfolgt zur Zeit eine zahnärztliche oder kieferorthopädische Behandlung oder ist sie angeraten oder beabsichtigt?\n\n'
      + '„Dokumentiert“ heißt: steht in der Krankenakte oder in einem Heil- und Kostenplan.',
    options: [
      { value: 'Ja, bereits dokumentiert', title: 'Ja, dokumentiert' },
      { value: 'Ja, nur kommuniziert', title: 'Ja, nur besprochen' },
      { value: 'Nein', title: 'Nein' },
    ],
  },
  {
    key: 'heilkostenplan', type: 'choice', field: 'heilkostenplan',
    text: 'Liegt ein aktueller Heil- und Kostenplan Ihres Zahnarztes vor?',
    options: YES_NO,
  },
  {
    key: 'fehlendeZaehne', type: 'choice', field: 'fehlendeZaehne',
    text: 'Wie viele Zähne fehlen, die nicht ersetzt sind? Weisheitszähne zählen nicht mit.',
    options: opts('0', '1', '2', '3', '4', { value: '4+', title: 'Mehr als 4' }),
    // Typed numbers are counts here, not list positions.
    match: (t) => {
      const n = /^\d+$/.test(t.trim()) ? parseInt(t, 10) : NaN;
      if (Number.isNaN(n)) return null;
      return n > 4 ? '4+' : String(n);
    },
  },
  {
    key: 'zahnluecke', type: 'choice', field: 'zahnluecke',
    text: 'Möchten Sie die Zahnlücke mitversichern?',
    options: YES_NO,
  },
  {
    key: 'parodontose', type: 'choice', field: 'parodontose',
    text: 'Wird derzeit oder wurde innerhalb der letzten drei Jahre eine parodontale Erkrankung (Parodontitis) festgestellt und/oder behandelt?\n\n'
      + '„In Behandlung“ gilt auch, wenn sie vor Vertragsbeginn festgestellt wurde.',
    options: [
      { value: 'Ja, aktuell in Behandlung', title: 'Ja, in Behandlung' },
      { value: 'Ja, ausgeheilt', title: 'Ja, ausgeheilt' },
      { value: 'Nein', title: 'Nein' },
    ],
  },
  {
    key: 'schwerpunkt', type: 'multi', field: 'schwerpunkt',
    text: 'Welcher Bereich ist Ihnen am wichtigsten? Mehrere Antworten möglich.',
    options: [
      'Zahnersatz',
      'Zahnbehandlung',
      'Kieferorthopädie',
      'Kosmetische Eingriffe (Zahnreinigung, Bleaching etc.)',
    ],
  },
  {
    key: 'vorherigeVersicherung', type: 'choice', field: 'vorherigeVersicherung',
    text: 'Bestand innerhalb der letzten 6 Monate bereits eine anderweitige Zahnersatzversicherung?',
    options: YES_NO,
  },

  {
    key: 'kontaktweg', type: 'multi', field: 'kontaktweg',
    text: '*4/4 Beratung & Kontakt*\nWie darf Marco Sie kontaktieren? Mehrere Antworten möglich.',
    options: ['per E-Mail', 'Telefonisch', 'WhatsApp'],
  },
  {
    key: 'zusatzversicherung', type: 'multi', field: 'zusatzversicherung',
    text: 'Besteht Interesse an weiteren Zusatzabsicherungen? Mehrere Antworten möglich.',
    options: [
      'ambulante Zusatzabsicherung (Heilpraktiker, Sehhilfen, Präventive Gesundheitsmaßnahmen)',
      'stationäre Zusatzabsicherung (Chefarztbehandlung, 1-2 Bett Zimmer, Behandlung als Privatpatient)',
      'Sehhilfen (Kostenübernahme für Brillen und Kontaktlinsen, Lasix Operation)',
      'private Unfallabsicherung (steuerfreie Auszahlung bei einem privaten Unfall, Kinder mitversichern)',
      'keinen Bedarf (Bestandsprodukt vorhanden oder kein Interesse)',
    ],
  },
  {
    key: 'beratungstermin', type: 'multi', field: 'beratungstermin',
    text: 'Wünschen Sie einen Termin zur digitalen Vollberatung? Mehrere Antworten möglich.',
    options: [
      'Analyse der allgemeinen finanziellen Situation (Masterplan für die Zukunft)',
      'Analyse und Optimierung Ihrer Vorsorge (Alters-, Kinder-, und sonstige Vorsorge)',
      'Arbeitskraftabsicherung (schwere Krankheit, Unfall, Lohnfortzahlung)',
      'Der Weg zum Betongold (eigene Immobilie und Kapitalanlage)',
      'Finanzierungen (über 500 Banken im Vergleich)',
      'Vermögensaufbau und Geldanlage',
      'keine weitere Beratung gewünscht',
    ],
    complete: 'zahnzusatz',
  },

  // ─── Gespräch ───
  {
    key: 'g_name', type: 'text', field: 'name',
    text: `*Gespräch mit Marco*\nGern! Ihre Angaben nutzt Marco nur für Ihre Anfrage (Datenschutz: ${PRIVACY_URL}).\n\nWie heißen Sie?`,
    validate: (t) => (t.length >= 2 ? null : 'Bitte geben Sie Ihren Namen an.'),
  },
  {
    key: 'g_anliegen', type: 'text', field: 'anliegen',
    ask: (data) => ({
      text: `Danke, ${firstName(data.name)}. Worum geht es, kurz in ein paar Worten? Zum Beispiel Altersvorsorge, Berufsunfähigkeit oder ein Vertrag, den Sie prüfen lassen möchten.`,
    }),
    validate: (t) => (t.length >= 3 ? null : 'Beschreiben Sie Ihr Anliegen bitte in ein paar Worten.'),
    complete: 'gespraech',
  },
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));
const getStep = (key) => STEPS[STEP_INDEX[key]];

export const MESSAGES = {
  zahnzusatz: (data) => `Vielen Dank, ${firstName(data.name)}! Ihre Angaben sind bei Marco angekommen. Er meldet sich innerhalb von 24 Stunden mit Ihrem persönlichen Angebot.\n\nRückfragen können Sie jederzeit hier im Chat stellen.`,
  gespraech: (data) => `Danke, ${firstName(data.name)}! Marco meldet sich persönlich hier im Chat bei Ihnen.`,
  cancelled: 'Alles klar, ich habe das Gespräch beendet und Ihre Angaben verworfen. Sie können Marco hier trotzdem jederzeit schreiben.',
  saveFailed: 'Entschuldigung, beim Speichern ist ein technischer Fehler aufgetreten. Bitte senden Sie Ihre letzte Antwort gleich noch einmal oder schreiben Sie an kontakt@marcoarpa.com.',
};

// Question of a step as reply, optionally prefixed with a hint (e.g. a validation error).
export function ask(key, data, ctx, prefix) {
  const step = getStep(key);
  let msg;
  if (step.ask) {
    msg = step.ask(data, ctx);
  } else if (step.type === 'choice') {
    const fitsButtons = step.options.length <= 3 && step.options.every((o) => o.title.length <= 20);
    const items = step.options.map((o, i) => ({ id: `opt:${i}`, title: o.title, description: o.description }));
    msg = fitsButtons ? { text: step.text, buttons: items } : { text: step.text, list: items };
  } else if (step.type === 'multi') {
    const lines = step.options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    msg = { text: `${step.text}\n\n${lines}\n\n${MULTI_HINT}` };
  } else if (step.optional) {
    msg = { text: step.text, buttons: [{ id: 'skip', title: 'Überspringen' }] };
  } else {
    msg = { text: step.text };
  }
  return prefix ? { ...msg, text: `${prefix}\n\n${msg.text}` } : msg;
}

// Starts a fresh dialogue (lead came in through the website link).
export function begin(ctx) {
  return { state: FIRST_STEP, data: {}, replies: [ask(FIRST_STEP, {}, ctx)], complete: null };
}

// Advances an active dialogue by one incoming message.
// input: { text, id } where id is the reply id of a tapped button or list row.
export function advance(conv, input, ctx) {
  const { state } = conv;
  const data = { ...conv.data };
  const text = (input.text || '').trim();
  const command = text.toLowerCase().replace(/[.!]+$/, '');

  if (['abbrechen', 'stop', 'stopp', 'ende'].includes(command)) {
    return { state: 'cancelled', data: {}, replies: [{ text: MESSAGES.cancelled }], complete: null };
  }
  if (['zurück', 'zurueck'].includes(command)) {
    const history = data._history || [];
    const prev = history.length ? history[history.length - 1] : state;
    data._history = history.slice(0, -1);
    return { state: prev, data, replies: [ask(prev, data, ctx)], complete: null };
  }

  const step = getStep(state);
  if (!step) return begin(ctx);

  const result = readAnswer(step, { text, id: input.id }, data, ctx);
  if (result.error) {
    return { state, data, replies: [ask(state, data, ctx, result.error)], complete: null };
  }

  if (result.value !== undefined) data[step.field] = result.value;
  const nextKey = result.next
    || (typeof step.next === 'function' ? step.next(result.value) : step.next)
    || (step.complete ? null : STEPS[STEP_INDEX[state] + 1]?.key);

  if (step.complete) {
    return { state: 'done', data, replies: [], complete: step.complete };
  }
  if (nextKey === 'cancel') {
    return { state: 'cancelled', data: {}, replies: [{ text: MESSAGES.cancelled }], complete: null };
  }

  data._history = [...(data._history || []), state];
  return { state: nextKey, data, replies: [ask(nextKey, data, ctx)], complete: null };
}

function readAnswer(step, input, data, ctx) {
  if (step.type === 'custom') return step.handle(input, data, ctx);

  if (step.type === 'choice') {
    const byId = /^opt:(\d+)$/.exec(input.id || '');
    if (byId && step.options[+byId[1]]) return { value: step.options[+byId[1]].value };
    const t = input.text.toLowerCase();
    if (!t) return { error: 'Bitte wählen Sie eine der Antworten.' };
    if (step.match) {
      const v = step.match(input.text);
      if (v != null) return { value: v };
    }
    const byTitle = step.options.find((o) => o.title.toLowerCase() === t || String(o.value).toLowerCase() === t);
    if (byTitle) return { value: byTitle.value };
    // A typed "ja" matches "Ja, einverstanden", but only if no other answer starts the same way.
    const byPrefix = step.options.filter((o) => o.title.toLowerCase().startsWith(t));
    if (byPrefix.length === 1) return { value: byPrefix[0].value };
    const n = /^\d+$/.test(t) ? parseInt(t, 10) : NaN;
    if (n >= 1 && n <= step.options.length) return { value: step.options[n - 1].value };
    return { error: 'Bitte tippen Sie auf eine der Antworten.' };
  }

  if (step.type === 'multi') {
    const nums = (input.text.match(/\d+/g) || []).map((n) => parseInt(n, 10));
    const valid = nums.length > 0 && nums.every((n) => n >= 1 && n <= step.options.length);
    if (!valid) return { error: MULTI_HINT };
    return { value: [...new Set(nums)].sort((a, b) => a - b).map((n) => step.options[n - 1]) };
  }

  // text
  if (step.optional && (input.id === 'skip' || /^(überspringen|ueberspringen|-)$/i.test(input.text))) {
    return { value: '' };
  }
  if (!input.text) return { error: 'Bitte antworten Sie mit einer Textnachricht.' };
  const value = input.text.slice(0, 1000);
  if (step.parse) return step.parse(value);
  const error = step.validate ? step.validate(value) : null;
  return error ? { error } : { value };
}

// Accepts 14.03.1985 or 14.3.1985 (four-digit years only, "85" is ambiguous).
// Stored as YYYY-MM-DD like the date input of the web form.
function parseBirthdate(t) {
  const error = { error: 'Bitte das Geburtsdatum im Format TT.MM.JJJJ, z. B. 14.03.1985.' };
  const m = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/.exec(t.replace(/\s/g, ''));
  if (!m) return error;
  const [d, mo, y] = [+m[1], +m[2], +m[3]];
  const date = new Date(Date.UTC(y, mo - 1, d));
  const valid = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
  if (!valid || y < 1900 || date > new Date()) return error;
  return { value: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
}

function parsePhone(t) {
  const digits = (t || '').replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 6 && digits.length <= 16 ? t.trim() : null;
}

export function formatWaId(waId) {
  return `+${waId}`;
}

function firstName(name) {
  return (name || '').trim().split(/\s+/)[0] || '';
}
