// The offer as PDF, rendered by Chrome on the server: the page /admin/angebot/[id] with its print
// styles. Used for the download and for sending the offer by e-mail. Browsers' own "save as PDF" is
// unreliable (Safari saves blank pages), so the CRM always uses this.
// Locally CHROME_PATH points to an installed Chrome; on Vercel @sparticuz/chromium is used.

import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from './supabase';
import { DOKUMENTE_BUCKET } from './dokumente';

async function browserStarten() {
  const puppeteer = (await import('puppeteer-core')).default;
  if (process.env.CHROME_PATH) {
    return puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  }
  const chromium = (await import('@sparticuz/chromium')).default;
  return puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
}

export const dateiname = (name) => `Zahnzusatz-Vergleich ${String(name || 'Kunde').replace(/[^\p{L}\p{N} .-]/gu, '').trim()} ${new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}.pdf`;

// Only the parameters of the offer itself: tariffs (t), recommendation (e), insurer names (g), note (n),
// insurance start (b, YYYY-MM-DD).
export function angebotParameter(quelle) {
  const auswahl = new URLSearchParams();
  quelle.getAll('t').slice(0, 3).forEach((t) => auswahl.append('t', t));
  ['e', 'g', 'n', 'b'].forEach((k) => { if (quelle.has(k)) auswahl.set(k, String(quelle.get(k)).slice(0, 600)); });
  return auswahl;
}

// Renders the offer; the page loads the lead through the CRM API with the caller's login cookie.
// Returns { pdf: Buffer, datei }.
export async function angebotAlsPdf({ origin, id, auswahl, cookie }) {
  let browser;
  try {
    browser = await browserStarten();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ cookie: cookie || '' });
    await page.goto(`${origin}/admin/angebot/${id}?${auswahl.toString()}&pdf=1`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('[data-angebot-fertig]', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    const name = await page.$eval('[data-angebot-fertig]', (el) => el.getAttribute('data-angebot-fertig'));
    const pdf = Buffer.from(await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
    return { pdf, datei: dateiname(name) };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// Files the PDF with the lead's documents (Art "Angebot"). Returns true when it worked.
export async function angebotAblegen(id, pdf, datei) {
  const supabase = getSupabaseAdmin();
  const pfad = `${id}/${randomUUID()}.pdf`;
  const { error: upError } = await supabase.storage.from(DOKUMENTE_BUCKET).upload(pfad, pdf, { contentType: 'application/pdf' });
  if (upError) {
    console.error('Angebot ablegen:', upError);
    return false;
  }
  const { error } = await supabase.from('lead_dokumente').insert({ submission_id: id, art: 'Angebot', dateiname: datei, pfad, groesse: pdf.length, mime: 'application/pdf' });
  if (error) {
    console.error('Angebot ablegen:', error);
    await supabase.storage.from(DOKUMENTE_BUCKET).remove([pfad]);
    return false;
  }
  return true;
}
