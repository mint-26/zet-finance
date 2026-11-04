import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAuthenticated } from '../../../lib/auth';
import { DOKUMENTE_BUCKET } from '../../../lib/dokumente';

export const dynamic = 'force-dynamic';

// Long enough for a backup of a nearly full storage on a slow connection.
const BACKUP_LINK_SECONDS = 2 * 60 * 60;
const PAGE = 1000;

const fail = (error) => NextResponse.json({ error }, { status: 500 });

// GET: storage in use and number of documents per lead. ?backup=1 adds all documents with download links for the backup.
export async function GET(request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('lead_dokumente')
      .select('id, submission_id, art, dateiname, pfad, groesse')
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) {
      console.error('Dokumente laden:', error);
      return fail('Dokumente konnten nicht geladen werden');
    }
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  const belegt = rows.reduce((sum, r) => sum + Number(r.groesse || 0), 0);
  const proLead = {};
  rows.forEach((r) => { proLead[r.submission_id] = (proLead[r.submission_id] || 0) + 1; });

  if (new URL(request.url).searchParams.get('backup') !== '1') {
    return NextResponse.json({ belegt, anzahl: rows.length, proLead });
  }

  if (rows.length === 0) return NextResponse.json({ belegt, anzahl: 0, dokumente: [] });
  const { data: links, error } = await supabase.storage
    .from(DOKUMENTE_BUCKET)
    .createSignedUrls(rows.map((r) => r.pfad), BACKUP_LINK_SECONDS);
  if (error) {
    console.error('Backup-Links:', error);
    return fail('Die Download-Links konnten nicht erstellt werden');
  }
  const urlOf = new Map(links.map((l) => [l.path, l.signedUrl]));
  const dokumente = rows.map(({ pfad, ...r }) => ({ ...r, url: urlOf.get(pfad) || null }));
  return NextResponse.json({ belegt, anzahl: rows.length, dokumente });
}
