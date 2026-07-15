import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isAuthenticated } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = [
  'status',
  'ablehnungsgrund',
  'gesellschaft',
  'abgerechnet',
  'notizen',
  'alt_vertrag_gekuendigt',
  'kuendigungsbestaetigung_erhalten',
];
const ALLOWED_STATUS = ['offen', 'angebot_verschickt', 'abgelehnt', 'versichert', 'kein_interesse'];
const ALLOWED_ABLEHNUNGSGRUND = ['mehr als 4 fehlende Zähne', 'Bonität'];
const BOOLEAN_FIELDS = new Set([
  'abgerechnet',
  'alt_vertrag_gekuendigt',
  'kuendigungsbestaetigung_erhalten',
]);

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
      let value = body[key];
      if (value === '' || value === null || value === undefined) {
        value = null;
      } else if (BOOLEAN_FIELDS.has(key)) {
        // Normalize "true"/"false"/1/0/true/false → boolean
        if (typeof value === 'string') {
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else { return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 }); }
        } else if (typeof value !== 'boolean') {
          return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
        }
      }
      update[key] = value;
    }
  }

  if (update.status && !ALLOWED_STATUS.includes(update.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (update.ablehnungsgrund != null && !ALLOWED_ABLEHNUNGSGRUND.includes(update.ablehnungsgrund)) {
    return NextResponse.json({ error: 'Invalid ablehnungsgrund' }, { status: 400 });
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
