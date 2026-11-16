import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../lib/auth';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { DOKUMENTE_BUCKET } from '../../../../lib/dokumente';

// The offer as PDF, rendered by Chrome on the server: the same page as /admin/angebot/[id], with
// its print styles. Browsers' own "save as PDF" is unreliable (Safari saves blank pages and prints
// the URL into the footer), so the CRM downloads this file instead. With ?ablegen=1 the PDF is
// also stored with the lead's documents (Art "Angebot").
// Locally: CHROME_PATH points to an installed Chrome; on Vercel @sparticuz/chromium is used.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

async function browserStarten() {
  const puppeteer = (await import('puppeteer-core')).default;
  if (process.env.CHROME_PATH) {
    return puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  }
  const chromium = (await import('@sparticuz/chromium')).default;
  return puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
}

const dateiname = (name) => `Zahnzusatz-Vergleich ${String(name || 'Kunde').replace(/[^\p{L}\p{N} .-]/gu, '').trim()}.pdf`;

export async function GET(request, { params }) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const url = new URL(request.url);
  const ablegen = url.searchParams.get('ablegen') === '1';
  const auswahl = new URLSearchParams();
  url.searchParams.getAll('t').slice(0, 3).forEach((t) => auswahl.append('t', t));
  ['e', 'g'].forEach((k) => { if (url.searchParams.has(k)) auswahl.set(k, url.searchParams.get(k)); });
  const seite = `${url.origin}/admin/angebot/${id}?${auswahl.toString()}&pdf=1`;

  let browser;
  let pdf;
  let name = 'Kunde';
  try {
    browser = await browserStarten();
    const page = await browser.newPage();
    // The page loads the lead through the CRM API, with the same login.
    await page.setExtraHTTPHeaders({ cookie: request.headers.get('cookie') || '' });
    await page.goto(seite, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('[data-angebot-fertig]', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    name = await page.$eval('[data-angebot-fertig]', (el) => el.getAttribute('data-angebot-fertig'));
    pdf = Buffer.from(await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
  } catch (err) {
    console.error('Angebot als PDF:', err);
    return NextResponse.json({ error: 'Das PDF konnte nicht erstellt werden' }, { status: 500 });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const datei = dateiname(name);
  let abgelegt = false;
  if (ablegen) {
    const supabase = getSupabaseAdmin();
    const pfad = `${id}/${randomUUID()}.pdf`;
    const { error: upError } = await supabase.storage.from(DOKUMENTE_BUCKET).upload(pfad, pdf, { contentType: 'application/pdf' });
    if (!upError) {
      const { error } = await supabase.from('lead_dokumente').insert({ submission_id: id, art: 'Angebot', dateiname: datei, pfad, groesse: pdf.length, mime: 'application/pdf' });
      if (error) await supabase.storage.from(DOKUMENTE_BUCKET).remove([pfad]);
      else abgelegt = true;
    }
    if (!abgelegt) console.error('Angebot ablegen:', upError);
  }

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="angebot.pdf"; filename*=UTF-8''${encodeURIComponent(datei)}`,
      'Cache-Control': 'no-store',
      'X-Angebot-Abgelegt': abgelegt ? '1' : '0',
    },
  });
}
