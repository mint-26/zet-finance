import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAuthenticated } from '../../../lib/auth';
import { formToRow, insertSubmission, notifySubmission } from '../../../lib/submissions';

export const dynamic = 'force-dynamic';
// Generous: notification path can take up to ~16 s in worst case.
export const maxDuration = 30;

// POST /api/submissions  — public. Called by the questionnaire.
// Saves the lead first (must not fail), then attempts to deliver the
// e-mail notification with retry/backoff. The notification result is
// persisted on the same row so the admin can see "mail not sent" state
// and trigger a manual resend later.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let data;
  try {
    data = await insertSubmission(formToRow(body));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  const result = await notifySubmission(data);

  return NextResponse.json({
    ok: true,
    id: data.id,
    notification_sent: result.success,
  });
}

// GET /api/submissions  — auth required. Returns all submissions.
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('zahnzusatz_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase select error:', error);
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
  }

  return NextResponse.json({ submissions: data });
}
