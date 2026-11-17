import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isAuthenticated } from '../../../../../lib/auth';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { angebotAlsPdf, angebotAblegen, angebotParameter } from '../../../../../lib/angebotPdf';

// Sends the offer to the customer: Marco's text from the offer page, the PDF attached
// (lib/angebotPdf.js), from kontakt@marcoarpa.com with replies going there too, and a blind copy
// to Marco. Afterwards the PDF is filed with the lead's documents, an open lead moves to
// "Angebot verschickt" and the notes get a line. ANGEBOT_MAIL_DRY_RUN=1 renders everything but
// does not send (for tests).

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const FROM = 'Marco Arpa <kontakt@marcoarpa.com>';
const KOPIE = process.env.NOTIFICATION_EMAIL || 'kontakt@marcoarpa.com';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const alsHtml = (text) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#141414">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
const fail = (error, status) => NextResponse.json({ error }, { status });

export async function POST(request, { params }) {
  if (!isAuthenticated()) return fail('Unauthorized', 401);
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return fail('Invalid id', 400);

  const body = await request.json().catch(() => ({}));
  const an = String(body.an || '').trim();
  const betreff = String(body.betreff || '').trim().slice(0, 200);
  const text = String(body.text || '').trim();
  if (!EMAIL.test(an)) return fail('Bitte eine gültige E-Mail-Adresse angeben', 400);
  if (!betreff || !text || text.length > 10000) return fail('Betreff und Text fehlen oder sind zu lang', 400);

  const url = new URL(request.url);
  let pdf;
  let datei;
  try {
    ({ pdf, datei } = await angebotAlsPdf({ origin: url.origin, id, auswahl: angebotParameter(new URLSearchParams(String(body.query || ''))), cookie: request.headers.get('cookie') }));
  } catch (err) {
    console.error('Angebot als PDF:', err);
    return fail('Das PDF konnte nicht erstellt werden', 500);
  }

  if (process.env.ANGEBOT_MAIL_DRY_RUN === '1') {
    console.log('Angebot-Mail (Testmodus, nicht gesendet):', { an, betreff, datei, groesse: pdf.length });
    return NextResponse.json({ ok: true, testmodus: true, datei });
  }
  if (!process.env.RESEND_API_KEY) return fail('E-Mail-Versand ist nicht eingerichtet', 500);

  const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM,
    to: [an],
    bcc: an.toLowerCase() === KOPIE.toLowerCase() ? undefined : [KOPIE],
    replyTo: KOPIE,
    subject: betreff,
    text,
    html: alsHtml(text),
    attachments: [{ filename: datei, content: pdf }],
  });
  if (error || !data?.id) {
    console.error('Angebot-Mail:', error || data);
    return fail('Die E-Mail konnte nicht gesendet werden', 502);
  }

  // Bookkeeping; the mail is out, so a failure here is reported but not fatal.
  const abgelegt = await angebotAblegen(id, pdf, datei);
  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from('zahnzusatz_submissions').select('status, notizen').eq('id', id).maybeSingle();
  const tag = new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
  const update = { notizen: [lead?.notizen, `${tag}: Angebot per E-Mail an ${an} gesendet.`].filter(Boolean).join('\n') };
  if (!lead?.status || lead.status === 'offen') update.status = 'angebot_verschickt';
  const { error: updError } = await supabase.from('zahnzusatz_submissions').update(update).eq('id', id);
  if (updError) console.error('Angebot-Mail vermerken:', updError);

  return NextResponse.json({ ok: true, abgelegt, status: update.status || lead?.status, notizen: update.notizen });
}
