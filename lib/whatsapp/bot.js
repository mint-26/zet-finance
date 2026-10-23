// Runs one incoming WhatsApp message through the dialogue: loads the
// conversation, advances it, stores it and saves the lead once complete.
// Sending is left to the caller, so the admin preview can reuse this.

import { getSupabaseAdmin } from '../supabase';
import { formToRow, insertSubmission } from '../submissions';
import { begin, advance, SILENT_STATES, MESSAGES, formatWaId } from './flow';
import { isTrigger } from './link';

const TABLE = 'whatsapp_conversations';
// Unfinished dialogues (and their answers) are dropped after this many days.
const KEEP_DAYS = 30;

// input: { text, id }. test: lead is stored as "WhatsApp (Test)" and no mail goes out.
// Returns { replies, submission } where submission is the new CRM row, if any.
export async function handleMessage({ waId, input, test = false }) {
  const supabase = getSupabaseAdmin();
  const { data: stored } = await supabase.from(TABLE).select('*').eq('wa_id', waId).maybeSingle();
  const conv = stored || { wa_id: waId, state: 'idle', data: {} };
  const ctx = { waId };

  let next;
  if (isTrigger(input.text)) {
    next = begin(ctx);
  } else if (SILENT_STATES.includes(conv.state)) {
    // Not started through the website link, or already finished: Marco answers himself.
    return { replies: [], submission: null };
  } else {
    next = advance(conv, input, ctx);
  }

  let submission = null;
  let replies = next.replies;
  let { state, data } = next;

  if (next.complete) {
    try {
      submission = await insertSubmission(buildRow(next.complete, data, waId, test));
      replies = [{ text: MESSAGES[next.complete](data) }];
      // The CRM holds the answers now, the conversation keeps only the link.
      data = {};
    } catch (err) {
      console.error('WhatsApp lead could not be saved:', err);
      // Stay on the last question so the lead can simply resend the answer.
      state = conv.state;
      data = conv.data;
      replies = [{ text: MESSAGES.saveFailed }];
    }
  }

  const { error } = await supabase.from(TABLE).upsert({
    wa_id: waId,
    state,
    data,
    ...(submission ? { submission_id: submission.id } : {}),
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('WhatsApp conversation save error:', error);

  return { replies, submission };
}

function buildRow(kind, data, waId, test) {
  const meta = { quelle: test ? 'whatsapp_test' : 'whatsapp', whatsapp_id: waId };
  if (kind === 'gespraech') {
    return {
      status: 'offen',
      anfrage_typ: 'gespraech',
      name: data.name || null,
      telefon: formatWaId(waId),
      kontaktweg: 'WhatsApp',
      anliegen: data.anliegen || null,
      ...meta,
    };
  }
  return { ...formToRow(data), anfrage_typ: 'zahnzusatz', ...meta };
}

// Marco wrote to the lead himself from the Business App (coexistence echo):
// a running dialogue stops, so the bot does not talk over him.
export async function pauseForManualReply(waId) {
  const { error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ state: 'manual', updated_at: new Date().toISOString() })
    .eq('wa_id', waId)
    .not('state', 'in', `(${SILENT_STATES.join(',')})`);
  if (error) console.error('WhatsApp pause error:', error);
}

// Returns true if the message id is new. Webhooks are retried by Meta,
// a retried message must not be answered twice.
export async function markSeen(messageId) {
  const { error } = await getSupabaseAdmin().from('whatsapp_seen_messages').insert({ id: messageId });
  if (!error) return true;
  if (error.code === '23505') return false;
  console.error('WhatsApp seen insert error:', error);
  return true;
}

export async function forgetSeen(messageId) {
  await getSupabaseAdmin().from('whatsapp_seen_messages').delete().eq('id', messageId);
}

// Drops stale dialogues and old message ids. Cheap enough to run on every webhook.
export async function cleanup() {
  const supabase = getSupabaseAdmin();
  const day = 24 * 60 * 60 * 1000;
  await supabase.from(TABLE).delete().lt('updated_at', new Date(Date.now() - KEEP_DAYS * day).toISOString());
  await supabase.from('whatsapp_seen_messages').delete().lt('created_at', new Date(Date.now() - 7 * day).toISOString());
}
