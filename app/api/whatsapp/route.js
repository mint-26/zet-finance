import { NextResponse } from 'next/server';
import { isConfigured, sendReplies, verifyWebhook } from '../../../lib/whatsapp/api';
import { handleMessage, pauseForManualReply, markSeen, forgetSeen, cleanup } from '../../../lib/whatsapp/bot';
import { notifySubmission } from '../../../lib/submissions';

export const dynamic = 'force-dynamic';
// A finished dialogue also sends the lead mail (up to ~16 s with retries).
export const maxDuration = 30;

// GET /api/whatsapp — webhook verification by Meta when the callback URL is set up.
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === token) {
    return new NextResponse(params.get('hub.challenge') || '', { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST /api/whatsapp — incoming messages (Meta Cloud API or 360dialog).
// Always answers 200 once the request is authentic, otherwise the provider
// keeps retrying; errors are logged instead.
export async function POST(request) {
  if (!isConfigured()) {
    return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 503 });
  }

  const raw = await request.text();
  if (!verifyWebhook(raw, request)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ownNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      if (ownNumberId && value.metadata?.phone_number_id && value.metadata.phone_number_id !== ownNumberId) continue;

      if (change.field === 'smb_message_echoes') {
        for (const echo of value.message_echoes || []) {
          if (echo.to) await pauseForManualReply(echo.to);
        }
        continue;
      }
      if (change.field !== 'messages') continue;

      for (const message of value.messages || []) {
        await processMessage(message);
      }
    }
  }

  await cleanup().catch((err) => console.error('WhatsApp cleanup error:', err));
  return NextResponse.json({ ok: true });
}

async function processMessage(message) {
  if (!message.from || !message.id) return;
  if (!(await markSeen(message.id))) return;

  let result;
  try {
    result = await handleMessage({ waId: message.from, input: readInput(message) });
  } catch (err) {
    console.error('WhatsApp message handling failed:', err);
    // Nothing was stored, so the provider's retry may handle it again.
    await forgetSeen(message.id).catch(() => {});
    return;
  }

  // The answer is stored at this point; a retry would apply it twice, so
  // send errors are only logged.
  try {
    if (result.replies.length) await sendReplies(message.from, result.replies);
  } catch (err) {
    console.error('WhatsApp reply failed:', err);
  }
  if (result.submission) await notifySubmission(result.submission);
}

// Text of a typed message or of a tapped button / list row.
function readInput(message) {
  switch (message.type) {
    case 'text':
      return { text: message.text?.body || '' };
    case 'interactive': {
      const reply = message.interactive?.button_reply || message.interactive?.list_reply || {};
      return { text: reply.title || '', id: reply.id };
    }
    case 'button':
      return { text: message.button?.text || '', id: message.button?.payload };
    default:
      // Images, voice messages etc. The dialogue asks for a text answer.
      return { text: '' };
  }
}
