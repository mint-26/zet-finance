import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isAuthenticated } from '../../../../lib/auth';
import { DOKUMENTE_BUCKET } from '../../../../lib/dokumente';
import { ANTWORT_FELDER, splitMulti } from '../../../../lib/fragebogen';
import { berechneBeitrag } from '../../../../lib/tarife';

// Fields the premium at closing depends on (lib/tarife.js).
const BEITRAG_FELDER = ['status', 'gesellschaft', 'tarif', 'geburtsdatum', 'fehlende_zaehne'];

export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = [
  'status',
  'ablehnungsgrund',
  'gesellschaft',
  'tarif',
  'abgerechnet',
  'notizen',
  'alt_vertrag_gekuendigt',
  'kuendigungsbestaetigung_erhalten',
  // Customer details Marco can correct by hand (CRM "Kundenangaben bearbeiten").
  'name',
  'email',
  'telefon',
  'anschrift',
  'geburtsdatum',
  'beruf',
  'krankenkasse',
  'anliegen',
  // Questionnaire answers, only with the options of the form (lib/fragebogen.js).
  ...Object.keys(ANTWORT_FELDER),
];
const TEXT_LIMITS = { name: 200, email: 200, telefon: 60, anschrift: 300, geburtsdatum: 20, beruf: 200, krankenkasse: 200, anliegen: 2000 };
const ALLOWED_STATUS = ['offen', 'angebot_verschickt', 'abgelehnt', 'versichert', 'kein_interesse'];
const ALLOWED_ABLEHNUNGSGRUND = ['mehr als 4 fehlende Zähne', 'Bonität'];
const BOOLEAN_FIELDS = new Set([
  'abgerechnet',
  'alt_vertrag_gekuendigt',
  'kuendigungsbestaetigung_erhalten',
]);

export async function PATCH(request, { params }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const update = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      let value = body[key];
      if (value === '' || value === null || value === undefined) {
        value = null;
      } else if (BOOLEAN_FIELDS.has(key)) {
        // Normalize "true"/"false"/1/0/true/false → boolean
        if (typeof value === 'string') {
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else { return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 }); }
        } else if (typeof value !== 'boolean') {
          return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
        }
      }
      update[key] = value;
    }
  }

  // "In aktuellen Monat holen" and its undo. The server sets the time.
  if ('wieder_aktiv' in body) update.wieder_aktiv_am = body.wieder_aktiv === true ? new Date().toISOString() : null;

  for (const [key, limit] of Object.entries(TEXT_LIMITS)) {
    if (!(key in update) || update[key] === null) continue;
    if (typeof update[key] !== 'string') return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
    update[key] = update[key].trim().slice(0, limit) || null;
  }
  if ('name' in update && !update.name) {
    return NextResponse.json({ error: 'Name must not be empty' }, { status: 400 });
  }

  // Answers: one of the form's options. In a list of several, an older answer that is no
  // longer offered may stay, but only if the lead already had it.
  const answers = Object.keys(ANTWORT_FELDER).filter((key) => key in update && update[key] !== null);
  if (answers.length) {
    const multiKeys = answers.filter((key) => ANTWORT_FELDER[key].multi);
    let stored = {};
    if (multiKeys.length) {
      const { data } = await getSupabaseAdmin().from('zahnzusatz_submissions').select(multiKeys.join(',')).eq('id', id).maybeSingle();
      stored = data || {};
    }
    for (const key of answers) {
      const { options, multi } = ANTWORT_FELDER[key];
      if (typeof update[key] !== 'string') return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      const parts = multi ? splitMulti(update[key]) : [update[key]];
      const before = multi ? splitMulti(stored[key]) : [];
      if (!parts.length || parts.some((part) => !options.includes(part) && !before.includes(part))) {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      }
      update[key] = multi ? parts.join(', ') : update[key];
    }
  }

  if (update.status && !ALLOWED_STATUS.includes(update.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (update.ablehnungsgrund != null && !ALLOWED_ABLEHNUNGSGRUND.includes(update.ablehnungsgrund)) {
    return NextResponse.json({ error: 'Invalid ablehnungsgrund' }, { status: 400 });
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (BEITRAG_FELDER.some((key) => key in update)) {
    const { data: current } = await supabase
      .from('zahnzusatz_submissions')
      .select('status, gesellschaft, tarif, geburtsdatum, fehlende_zaehne, abgeschlossen_am, created_at')
      .eq('id', id)
      .maybeSingle();

    // The closing date follows the status: it moves the lead to the top of that month in the CRM.
    if (update.status) {
      const wasClosed = current?.status === 'versichert';
      const isClosed = update.status === 'versichert';
      if (isClosed && !wasClosed) update.abgeschlossen_am = new Date().toISOString();
      if (!isClosed && wasClosed) update.abgeschlossen_am = null;
    }

    // Premium at closing, kept for the commission: the customer's age in the year of closing,
    // with the surcharge for missing teeth. It follows tariff and answers while the customer is
    // insured, and is cleared when the status is taken back. Later price changes in
    // lib/tarife.js do not touch it.
    const merged = { ...(current || {}), ...update };
    if (merged.status === 'versichert') {
      const stichtag = new Date(merged.abgeschlossen_am || merged.created_at || Date.now());
      const beitrag = berechneBeitrag({
        gesellschaft: merged.gesellschaft, tarif: merged.tarif, geburtsdatum: merged.geburtsdatum, fehlendeZaehne: merged.fehlende_zaehne,
      }, stichtag);
      update.beitrag_abschluss = beitrag.ok ? beitrag.beitrag : null;
    } else if (current?.status === 'versichert') {
      update.beitrag_abschluss = null;
    }
  }

  const { error } = await supabase
    .from('zahnzusatz_submissions')
    .update(update)
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }

  const dates = Object.fromEntries(['abgeschlossen_am', 'wieder_aktiv_am', 'beitrag_abschluss'].filter((k) => k in update).map((k) => [k, update[k]]));
  return NextResponse.json({ ok: true, ...dates });
}

export async function DELETE(request, { params }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Files first: table rows follow the lead automatically, files in the storage do not. If this
  // fails, the lead stays, so no customer documents remain behind without a lead.
  const { data: dokumente, error: listError } = await supabase.from('lead_dokumente').select('pfad').eq('submission_id', id);
  const { error: storageError } = dokumente?.length
    ? await supabase.storage.from(DOKUMENTE_BUCKET).remove(dokumente.map((d) => d.pfad))
    : { error: null };
  if (listError || storageError) {
    console.error('Dokumente des Leads löschen:', listError || storageError);
    return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 });
  }

  const { error } = await supabase
    .from('zahnzusatz_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
