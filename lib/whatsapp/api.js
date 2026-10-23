// Sending WhatsApp messages. Two providers with the same message format:
//   meta       Cloud API directly (free test number while testing)
//   360dialog  Meta partner, needed to keep Marco's number in the Business App (coexistence)
// Switching is only a matter of env vars, see CLAUDE.md.

import crypto from 'crypto';

const PROVIDER = process.env.WHATSAPP_PROVIDER || 'meta';
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v24.0';
// Logs messages instead of sending them (local tests).
const DRY_RUN = process.env.WHATSAPP_DRY_RUN === '1';

export function isConfigured() {
  if (DRY_RUN) return true;
  return PROVIDER === '360dialog' ? !!TOKEN : !!(TOKEN && PHONE_NUMBER_ID);
}

function endpoint() {
  return PROVIDER === '360dialog'
    ? { url: 'https://waba-v2.360dialog.io/messages', headers: { 'D360-API-KEY': TOKEN } }
    : { url: `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`, headers: { Authorization: `Bearer ${TOKEN}` } };
}

const cut = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);

// Converts a bot reply ({ text, buttons?, list? }) into a Cloud API message body.
export function toApiMessage(to, reply) {
  const base = { messaging_product: 'whatsapp', recipient_type: 'individual', to };
  if (reply.buttons) {
    return {
      ...base,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: cut(reply.text, 1024) },
        action: { buttons: reply.buttons.map((b) => ({ type: 'reply', reply: { id: b.id, title: cut(b.title, 20) } })) },
      },
    };
  }
  if (reply.list) {
    return {
      ...base,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: cut(reply.text, 1024) },
        action: {
          button: 'Antwort wählen',
          sections: [{
            title: 'Antworten',
            rows: reply.list.map((r) => ({
              id: r.id,
              title: cut(r.title, 24),
              ...(r.description ? { description: cut(r.description, 72) } : {}),
            })),
          }],
        },
      },
    };
  }
  return { ...base, type: 'text', text: { body: cut(reply.text, 4096), preview_url: false } };
}

// Sends the replies one after another so they arrive in order.
export async function sendReplies(to, replies) {
  for (const reply of replies) {
    const body = toApiMessage(to, reply);
    if (DRY_RUN) {
      console.log('[whatsapp dry-run] →', to, JSON.stringify(body));
      continue;
    }
    const { url, headers } = endpoint();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`WhatsApp send failed ${res.status}: ${detail.slice(0, 300)}`);
    }
  }
}

// Webhook authenticity. Meta signs the body with the app secret
// (X-Hub-Signature-256). 360dialog does not sign, there the webhook URL
// carries a secret key (?key=...). At least one of both must be set.
export function verifyWebhook(rawBody, request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const urlKey = process.env.WHATSAPP_WEBHOOK_KEY;
  if (!appSecret && !urlKey) return false;

  if (appSecret) {
    const header = request.headers.get('x-hub-signature-256') || '';
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    if (!safeEqual(header, expected)) return false;
  }
  if (urlKey) {
    const key = new URL(request.url).searchParams.get('key') || '';
    if (!safeEqual(key, urlKey)) return false;
  }
  return true;
}

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}
