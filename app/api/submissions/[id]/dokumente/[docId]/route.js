import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../../lib/supabase';
import { isAuthenticated } from '../../../../../../lib/auth';
import { DOKUMENTE_BUCKET } from '../../../../../../lib/dokumente';

export const dynamic = 'force-dynamic';

const LINK_SECONDS = 60;

const fail = (error, status) => NextResponse.json({ error }, { status });

async function findDocument(supabase, params) {
  const id = parseInt(params.id, 10);
  const docId = parseInt(params.docId, 10);
  if (!Number.isFinite(id) || !Number.isFinite(docId)) return null;
  const { data } = await supabase
    .from('lead_dokumente')
    .select('id, dateiname, pfad')
    .eq('id', docId)
    .eq('submission_id', id)
    .maybeSingle();
  return data;
}

// GET: forwards to a short-lived link to the file, so the CRM can use plain links that no
// pop-up blocker stops. ?download=1 saves the file instead of showing it.
export async function GET(request, { params }) {
  if (!isAuthenticated()) return fail('Unauthorized', 401);
  const supabase = getSupabaseAdmin();
  const doc = await findDocument(supabase, params);
  if (!doc) return fail('Dokument nicht gefunden', 404);

  const download = new URL(request.url).searchParams.get('download') === '1';
  const { data, error } = await supabase.storage.from(DOKUMENTE_BUCKET).createSignedUrl(doc.pfad, LINK_SECONDS);
  if (error) {
    console.error('Dokument-Link:', error);
    return fail('Das Dokument konnte nicht geöffnet werden', 500);
  }
  // Set here, because the option of createSignedUrl encodes the name twice: umlauts arrive broken.
  const url = new URL(data.signedUrl);
  if (download) url.searchParams.set('download', doc.dateiname);
  return NextResponse.redirect(url.toString(), { status: 302, headers: { 'Cache-Control': 'no-store' } });
}

// DELETE: the file first. If that fails, the entry stays, so no file is left behind unnoticed.
export async function DELETE(request, { params }) {
  if (!isAuthenticated()) return fail('Unauthorized', 401);
  const supabase = getSupabaseAdmin();
  const doc = await findDocument(supabase, params);
  if (!doc) return fail('Dokument nicht gefunden', 404);

  const { error: storageError } = await supabase.storage.from(DOKUMENTE_BUCKET).remove([doc.pfad]);
  if (storageError) {
    console.error('Datei löschen:', storageError);
    return fail('Die Datei konnte nicht gelöscht werden', 500);
  }
  const { error } = await supabase.from('lead_dokumente').delete().eq('id', doc.id);
  if (error) {
    console.error('Dokument löschen:', error);
    return fail('Das Dokument konnte nicht gelöscht werden', 500);
  }
  return NextResponse.json({ ok: true });
}
