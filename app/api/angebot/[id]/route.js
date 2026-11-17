import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../lib/auth';
import { angebotAlsPdf, angebotAblegen, angebotParameter } from '../../../../lib/angebotPdf';

// The offer as PDF download (lib/angebotPdf.js). With ?ablegen=1 it is also filed with the lead's
// documents (Art "Angebot").

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request, { params }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const url = new URL(request.url);
  let pdf;
  let datei;
  try {
    ({ pdf, datei } = await angebotAlsPdf({ origin: url.origin, id, auswahl: angebotParameter(url.searchParams), cookie: request.headers.get('cookie') }));
  } catch (err) {
    console.error('Angebot als PDF:', err);
    return NextResponse.json({ error: 'Das PDF konnte nicht erstellt werden' }, { status: 500 });
  }

  const abgelegt = url.searchParams.get('ablegen') === '1' ? await angebotAblegen(id, pdf, datei) : false;

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="angebot.pdf"; filename*=UTF-8''${encodeURIComponent(datei)}`,
      'Cache-Control': 'no-store',
      'X-Angebot-Abgelegt': abgelegt ? '1' : '0',
    },
  });
}
