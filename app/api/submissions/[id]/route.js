import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isAuthenticated } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = ['status', 'provision', 'monatsbeitrag', 'grund', 'gesellschaft', 'notizen'];
const ALLOWED_STATUS = ['offen', 'in_bearbeitung', 'abgelehnt', 'versichert'];

export async function PATCH(request, { params }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const update = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      update[key] = body[key] === '' ? null : body[key];
    }
  }

  if (update.status && !ALLOWED_STATUS.includes(update.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('zahnzusatz_submissions')
    .update(update)
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('zahnzusatz_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
