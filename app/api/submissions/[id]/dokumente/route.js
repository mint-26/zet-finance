import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase';
import { isAuthenticated } from '../../../../../lib/auth';
import { DOKUMENTE_BUCKET, DOKUMENT_ARTEN, MAX_DATEIGROESSE, endungVon, mimeVon } from '../../../../../lib/dokumente';

export const dynamic = 'force-dynamic';

const FIELDS = 'id, created_at, art, dateiname, groesse';

const fail = (error, status) => NextResponse.json({ error }, { status });

// GET: the documents of a lead.
export async function GET(request, { params }) {
  if (!isAuthenticated()) return fail('Unauthorized', 401);
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return fail('Invalid id', 400);

  const { data, error } = await getSupabaseAdmin()
    .from('lead_dokumente')
    .select(FIELDS)
    .eq('submission_id', id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Dokumente laden:', error);
    return fail('Dokumente konnten nicht geladen werden', 500);
  }
  return NextResponse.json({ dokumente: data });
}

// POST: step 1 of an upload. Vercel functions take at most 4.5 MB per request, so the browser
// sends the file straight to Supabase, through this one-time link. The stored path contains
// no customer data; the real file name stays in the table.
export async function POST(request, { params }) {
  if (!isAuthenticated()) return fail('Unauthorized', 401);
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return fail('Invalid id', 400);

  const body = await request.json().catch(() => ({}));
  const dateiname = String(body.dateiname || '').trim();
  const mime = mimeVon(dateiname);
  if (!mime) return fail('Dieser Dateityp ist nicht erlaubt', 400);
  if (!(body.groesse > 0) || body.groesse > MAX_DATEIGROESSE) return fail('Die Datei darf höchstens 50 MB groß sein', 400);

  const pfad = `${id}/${randomUUID()}.${endungVon(dateiname)}`;
  const { data, error } = await getSupabaseAdmin().storage.from(DOKUMENTE_BUCKET).createSignedUploadUrl(pfad);
  if (error) {
    console.error('Upload vorbereiten:', error);
    return fail('Der Upload konnte nicht vorbereitet werden', 500);
  }
  return NextResponse.json({ pfad, uploadUrl: data.signedUrl, contentType: mime });
}

// PUT: step 2, after the upload. Only registers a file that really arrived in this lead's folder.
export async function PUT(request, { params }) {
  if (!isAuthenticated()) return fail('Unauthorized', 401);
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return fail('Invalid id', 400);

  const body = await request.json().catch(() => ({}));
  const dateiname = String(body.dateiname || '').trim().slice(0, 200);
  const pfad = String(body.pfad || '');
  if (!DOKUMENT_ARTEN.includes(body.art) || !dateiname || !pfad.startsWith(`${id}/`)) return fail('Ungültige Angaben', 400);

  const supabase = getSupabaseAdmin();
  const name = pfad.slice(pfad.indexOf('/') + 1);
  const { data: found, error: listError } = await supabase.storage.from(DOKUMENTE_BUCKET).list(String(id), { search: name, limit: 1 });
  const file = found?.find((f) => f.name === name);
  if (listError || !file) return fail('Die Datei ist nicht angekommen', 400);

  const { data, error } = await supabase
    .from('lead_dokumente')
    .insert({ submission_id: id, art: body.art, dateiname, pfad, groesse: file.metadata?.size || 0, mime: mimeVon(dateiname) })
    .select(FIELDS)
    .single();
  if (error) {
    console.error('Dokument speichern:', error);
    await supabase.storage.from(DOKUMENTE_BUCKET).remove([pfad]);
    return fail('Das Dokument konnte nicht gespeichert werden', 500);
  }
  return NextResponse.json({ dokument: data });
}
