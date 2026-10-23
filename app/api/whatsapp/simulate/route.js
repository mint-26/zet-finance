import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../lib/auth';
import { handleMessage } from '../../../../lib/whatsapp/bot';

export const dynamic = 'force-dynamic';

// POST /api/whatsapp/simulate — auth required. Bot preview in /admin/whatsapp:
// runs a message through the same dialogue as the webhook, but returns the
// replies instead of sending them. Leads are stored as "WhatsApp (Test)"
// and send no mail.
export async function POST(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Preview numbers start with 49000, which no real German number does.
  const waId = String(body.waId || '');
  if (!/^49000\d{6,8}$/.test(waId)) {
    return NextResponse.json({ error: 'Invalid preview number' }, { status: 400 });
  }

  const { replies, submission } = await handleMessage({
    waId,
    input: { text: String(body.text || '').slice(0, 1000), id: body.id || undefined },
    test: true,
  });

  return NextResponse.json({ replies, submissionId: submission?.id ?? null });
}
