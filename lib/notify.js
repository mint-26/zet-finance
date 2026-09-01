// Server-side notification helper.
// Sends lead notifications via Resend (https://resend.com).
// Replaces the legacy FormSubmit.co integration which became unreliable.
//
// Sandbox mode: no own domain is verified yet, so the sender is the
// Resend test sender (onboarding@resend.dev). The recipient (Marco's
// inbox) must be verified in the Resend dashboard once.

import { Resend } from 'resend';
import { formatBirthdate } from './format';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'kontakt@marcoarpa.com';
const FROM = 'Marco Arpa Leads <onboarding@resend.dev>';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Sends a notification email. Retries on transient errors with backoff.
// Returns { success, attempts, lastError }.
export async function sendNotification({ subject, fields }, opts = {}) {
  if (!resend) {
    return { success: false, attempts: 0, lastError: 'RESEND_API_KEY env var missing' };
  }

  const {
    maxAttempts = 3,
    backoffMs = [1000, 3000],
  } = opts;

  const html = renderHtmlBody(fields);
  const text = renderTextBody(fields);

  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      const delay = backoffMs[attempt - 2] ?? backoffMs[backoffMs.length - 1];
      await sleep(delay);
    }

    try {
      const { data, error } = await resend.emails.send({
        from: FROM,
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
        text,
      });

      if (error) {
        // Don't retry on permanent errors (validation, unverified recipient, etc.).
        const permanent = error.statusCode && error.statusCode >= 400 && error.statusCode < 500;
        lastError = `${error.name || 'ResendError'}${error.statusCode ? ' ' + error.statusCode : ''}: ${truncate(error.message || 'unknown', 220)}`;
        if (permanent) {
          return { success: false, attempts: attempt, lastError };
        }
      } else if (data?.id) {
        return { success: true, attempts: attempt, messageId: data.id };
      } else {
        lastError = `unexpected response: ${truncate(JSON.stringify(data))}`;
      }
    } catch (err) {
      lastError = `${err?.name || 'Error'}: ${err?.message || 'unknown'}`;
    }
  }

  return { success: false, attempts: maxAttempts, lastError };
}

export function buildQuestionnairePayload(row) {
  return {
    subject: 'Neues Zahnzusatz-Angebot: ' + (row.name || '(ohne Namen)'),
    fields: [
      ['Vor- und Nachname', row.name],
      ['Anschrift', row.anschrift],
      ['Geburtsdatum', formatBirthdate(row.geburtsdatum)],
      ['Geschlecht', row.geschlecht],
      ['Familienstand', row.familienstand],
      ['Telefon', row.telefon],
      ['E-Mail', row.email],
      ['Beruf', row.beruf],
      ['Krankenversicherungsart', row.versicherungsart],
      ['Krankenkasse', row.krankenkasse],
      ['Kassenwechsel', row.wechsel],
      ['Bonusprogramm', row.bonusprogramm],
      ['Aktuelle Behandlung', row.behandlung],
      ['Heil- und Kostenplan', row.heilkostenplan],
      ['Fehlende Zähne', row.fehlende_zaehne],
      ['Zahnlücke mitversichern', row.zahnluecke],
      ['Parodontose', row.parodontose],
      ['Schwerpunktbereich', row.schwerpunkt],
      ['Vorherige Zahnversicherung', row.vorherige_versicherung],
      ['Kontaktweg', row.kontaktweg],
      ['Zusatzversicherungen', row.zusatzversicherung],
      ['Beratungstermin', row.beratungstermin],
    ],
  };
}

export function buildContactPayload(form) {
  return {
    subject: 'Neue Kontaktanfrage von ' + (form.name || '(ohne Namen)'),
    fields: [
      ['Name', form.name],
      ['E-Mail', form.email],
      ['Telefon', form.phone],
      ['Bereich', form.service],
      ['Nachricht', form.message],
    ],
  };
}

function renderHtmlBody(fields) {
  const rows = fields
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([label, value]) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;width:200px;">${escapeHtml(label)}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#111;font-size:14px;line-height:1.5;">${escapeHtml(String(value))}</td>
      </tr>`)
    .join('');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f3;font-family:'Helvetica Neue',Arial,sans-serif;color:#111;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #e5e5e0;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 24px 16px;border-bottom:1px solid #eee;">
        <div style="color:#a0822a;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Neuer Lead</div>
        <div style="color:#666;font-size:13px;margin-top:6px;">via marcoarpa.com</div>
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>
    <div style="text-align:center;color:#999;font-size:12px;margin-top:16px;">Marco Arpa · Unabhängige Finanzberatung</div>
  </div>
</body></html>`;
}

function renderTextBody(fields) {
  return fields
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncate(s, max = 200) {
  if (typeof s !== 'string') return String(s);
  return s.length > max ? s.slice(0, max) + '…' : s;
}
