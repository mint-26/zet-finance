import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAuthenticated } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/submissions  — public. Called by the questionnaire.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('zahnzusatz_submissions')
    .insert({
      status: 'offen',
      name: body.name || null,
      anschrift: body.anschrift || null,
      geburtsdatum: body.geburtsdatum || null,
      familienstand: body.familienstand || null,
      telefon: body.telefon || null,
      email: body.email || null,
      beruf: body.beruf || null,
      versicherungsart: body.versicherungsart || null,
      krankenkasse: body.krankenkasse || null,
      wechsel: body.wechsel || null,
      bonusprogramm: body.bonusprogramm || null,
      behandlung: body.behandlung || null,
      heilkostenplan: body.heilkostenplan || null,
      fehlende_zaehne: body.fehlendeZaehne != null ? String(body.fehlendeZaehne) : null,
      zahnluecke: body.zahnluecke || null,
      parodontose: body.parodontose || null,
      schwerpunkt: Array.isArray(body.schwerpunkt) ? body.schwerpunkt.join(', ') : (body.schwerpunkt || null),
      vorherige_versicherung: body.vorherigeVersicherung || null,
      kontaktweg: Array.isArray(body.kontaktweg) ? body.kontaktweg.join(', ') : (body.kontaktweg || null),
      zusatzversicherung: Array.isArray(body.zusatzversicherung) ? body.zusatzversicherung.join(', ') : (body.zusatzversicherung || null),
      beratungstermin: Array.isArray(body.beratungstermin) ? body.beratungstermin.join(', ') : (body.beratungstermin || null),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
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
