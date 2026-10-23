// Saving leads to the CRM table and notifying Marco. Shared by the web
// questionnaire (/api/submissions) and the WhatsApp bot (/api/whatsapp).

import { getSupabaseAdmin } from './supabase';
import { sendNotification, buildPayload } from './notify';

const join = (v) => (Array.isArray(v) ? v.join(', ') : (v || null));

// Maps the questionnaire form (camelCase, arrays) to a table row.
export function formToRow(form) {
  return {
    status: 'offen',
    name: form.name || null,
    anschrift: form.anschrift || null,
    geburtsdatum: form.geburtsdatum || null,
    geschlecht: form.geschlecht || null,
    familienstand: form.familienstand || null,
    telefon: form.telefon || null,
    email: form.email || null,
    beruf: form.beruf || null,
    versicherungsart: form.versicherungsart || null,
    krankenkasse: form.krankenkasse || null,
    wechsel: form.wechsel || null,
    bonusprogramm: form.bonusprogramm || null,
    behandlung: form.behandlung || null,
    heilkostenplan: form.heilkostenplan || null,
    fehlende_zaehne: form.fehlendeZaehne != null ? String(form.fehlendeZaehne) : null,
    zahnluecke: form.zahnluecke || null,
    parodontose: form.parodontose || null,
    schwerpunkt: join(form.schwerpunkt),
    vorherige_versicherung: form.vorherigeVersicherung || null,
    kontaktweg: join(form.kontaktweg),
    zusatzversicherung: join(form.zusatzversicherung),
    beratungstermin: join(form.beratungstermin),
  };
}

// Inserts the lead. Returns the stored row, or throws.
export async function insertSubmission(row) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('zahnzusatz_submissions')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(`Supabase insert error: ${error.message}`);
  return data;
}

// Sends the lead mail with retry/backoff and records the result on the row,
// so the admin can show "mail not sent" and offer a manual resend.
export async function notifySubmission(row) {
  const result = await sendNotification(buildPayload(row));

  const patch = result.success
    ? { notification_sent_at: new Date().toISOString(), notification_attempts: result.attempts, notification_last_error: null }
    : { notification_attempts: result.attempts, notification_last_error: result.lastError || 'unknown' };

  const { error } = await getSupabaseAdmin()
    .from('zahnzusatz_submissions')
    .update(patch)
    .eq('id', row.id);

  if (error) console.error('Notification status patch error:', error);
  if (!result.success) {
    console.warn(`Notification failed for submission ${row.id} after ${result.attempts} attempts: ${result.lastError}`);
  }
  return result;
}
