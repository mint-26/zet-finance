import { NextResponse } from 'next/server';
import { sendNotification, buildContactPayload } from '../../../lib/notify';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST /api/contact — public. Called by the small Contact form.
// No DB persistence (contact form has no admin tracking). If the mail
// pipeline fails after retries, we still return ok:true to the caller
// so the user sees a friendly success screen — the failure is logged.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
  }

  const payload = buildContactPayload(body);
  const result = await sendNotification(payload);

  if (!result.success) {
    console.warn(`Contact notification failed after ${result.attempts} attempts: ${result.lastError}`);
  }

  return NextResponse.json({
    ok: true,
    notification_sent: result.success,
  });
}
