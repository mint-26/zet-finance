import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Visitors and the register are in Germany; the project default would be Washington.
export const preferredRegion = 'fra1';

// Address help for the questionnaire, from OpenPLZ API (German postcodes and streets, no
// key needed):
//   GET /api/adresse?plz=65812          towns of a postcode
//   GET /api/adresse?plz=65812&q=König  streets of that postcode
// The register knows no house numbers. A number typed into the street field is handed back
// for its own field and, like the visitor's IP, never reaches the service. Queries are not
// logged. Any failure returns an empty answer: this is only a help, every field can be
// filled in by hand.
const BASE = 'https://openplzapi.org/de';
const MAX_STREETS = 6;

// The register writes "Königsteiner Str." and "Bahnhofstr.", visitors also
// "Königsteinerstr", "Königsteiner Straße" or "Koenigsteiner".
function streetPattern(street) {
  return street
    .replace(/[.*+?^${}()|[\]\\]/g, '')
    .replace(/\s*(stra(ß|ss)e|str)$/i, ' ?str')
    .replace(/ae|ä/gi, '(ae|ä)').replace(/oe|ö/gi, '(oe|ö)').replace(/ue|ü/gi, '(ue|ü)')
    .replace(/ss|ß/gi, '(ss|ß)');
}

const fullName = (name) => name.replace(/Str\.$/, 'Straße').replace(/str\.$/, 'straße');

const respond = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function lookup(path, params) {
  const url = new URL(`${BASE}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { signal: AbortSignal.timeout(4000), cache: 'no-store' });
  if (!res.ok) throw new Error(`OpenPLZ ${res.status}`);
  return res.json();
}

export async function GET(request) {
  // Only for our own pages.
  if (['cross-site', 'same-site'].includes(request.headers.get('sec-fetch-site'))) return respond({}, 403);

  const params = new URL(request.url).searchParams;
  const plz = params.get('plz') || '';
  if (!/^\d{5}$/.test(plz)) return respond({ orte: [], results: [] });

  try {
    if (!params.has('q')) {
      const places = await lookup('Localities', { postalCode: plz, pageSize: 20 });
      return respond({ ok: true, orte: [...new Set(places.map((p) => p.name))] });
    }

    let text = (params.get('q') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    // A letter only counts as part of the number if no other letter follows: "5a", not the B of "5 Bach".
    const number = text.match(/(?<![\p{L}\d])\d+(\s?[a-zA-Z](?!\p{L}))?(\s?[-/+]\s?\d+(\s?[a-zA-Z](?!\p{L}))?)?/u)?.[0];
    if (number) text = text.replace(number, ' ').trim();
    if ((text.match(/\p{L}/gu) || []).length < 2) return respond({ results: [] });

    const streets = await lookup('Streets', { name: streetPattern(text), postalCode: plz, pageSize: 30 });
    const names = [...new Set(streets.map((s) => fullName(s.name)))];
    // Streets starting with the text first, then those merely containing it.
    const start = text.toLowerCase().slice(0, 3);
    names.sort((a, b) => Number(b.toLowerCase().startsWith(start)) - Number(a.toLowerCase().startsWith(start)));
    return respond({ results: names.slice(0, MAX_STREETS).map((label) => ({ label })), number: number?.replace(/\s+/g, '') });
  } catch {
    return respond({ orte: [], results: [] });
  }
}
