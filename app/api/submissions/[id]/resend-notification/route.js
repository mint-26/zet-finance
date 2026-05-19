import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { isAuthenticated } from '../../../../../lib/auth';
import { sendNotification, buildQuestionnairePayload } from '../../../../../lib/notify';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST /api/submissions/[id]/resend-notification — auth required.
// Re-runs the notification pipeline for a single submission. Used by the
// admin when a notification originally failed (e.g. provider was down).
export async function POST(_request, { params }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error: fetchError } = await supabase
    .from('zahnzusatz_submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const payload = buildQuestionnairePayload(row);
  const result = await sendNotification(payload);

  const totalAttempts = (row.notification_attempts || 0) + result.attempts;
  const patch = result.success
    ? { notification_sent_at: new Date().toISOString(), notification_attempts: totalAttempts, notification_last_error: null }
    : { notification_attempts: totalAttempts, notification_last_error: result.lastError || 'unknown' };

  const { error: patchError } = await supabase
    .from('zahnzusatz_submissions')
    .update(patch)
    .eq('id', id);

  if (patchError) {
    console.error('Resend patch error:', patchError);
  }

  return NextResponse.json({
    ok: result.success,
    attempts: result.attempts,
    error: result.success ? null : (result.lastError || 'unknown'),
  });
}
