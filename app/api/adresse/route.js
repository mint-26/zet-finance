import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/adresse?q=...  Address suggestions for the questionnaire, from the street
// register of OpenPLZ API (German streets with postcode and town, no key needed). It knows
// no house numbers, so the form asks for them separately. A number typed into the search
// anyway is handed back for that field and, like the visitor's IP, never reaches the
// service. Queries are not logged. Any failure returns an empty list: suggestions are only
// a help, the address can always be typed by hand.
const STREETS_URL = 'https://openplzapi.org/de/Streets';
const MAX_RESULTS = 5;
const STREET_END = /(str(a(ß|ss)e)?\.?|weg|platz|allee|gasse|ring|damm|ufer|pfad|steig)$/i;

// Regex for the start of the street name. The register writes "Königsteiner Str." and
// "Bahnhofstr.", visitors also "Königsteinerstr", "Königsteiner Straße" or "Koenigsteiner".
function streetPattern(street) {
  const body = street
    .replace(/[.*+?^${}()|[\]\\]/g, '')
    .replace(/\s*(stra(ß|ss)e|str)$/i, ' ?str')
    .replace(/ae|ä/gi, '(ae|ä)').replace(/oe|ö/gi, '(oe|ö)').replace(/ue|ü/gi, '(ue|ü)')
    .replace(/ss|ß/gi, '(ss|ß)');
  return `^${body}`;
}

// Splits the free text into postcode, house number and the possible street/town readings,
// most likely first: "Königsteinerstr 148", "Zeil 106 Frankfurt", "65812 Bad Soden, Königsteiner".
function parseQuery(raw) {
  let text = raw.replace(/\s+/g, ' ').trim();
  const postcode = text.match(/\b\d{5}\b/)?.[0];
  if (postcode) text = text.replace(postcode, ' ');
  // A letter only counts as part of the number if no other letter follows: "5a", not the K of "5 Köln".
  const number = text.match(/(?<![\p{L}\d])\d+(\s?[a-zA-Z](?!\p{L}))?(\s?[-/+]\s?\d+(\s?[a-zA-Z](?!\p{L}))?)?/u)?.[0];
  if (number) text = text.replace(number, ' ');

  const parts = text.split(',').map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const readings = [];
  if (parts.length >= 2) {
    const street = parts.find((p) => STREET_END.test(p)) || parts[parts.length - 1];
    readings.push({ street, locality: parts.find((p) => p !== street) });
  } else if (parts.length === 1) {
    const words = parts[0].split(' ');
    const end = words.findIndex((w) => STREET_END.test(w));
    if (end >= 0) {
      readings.push({ street: words.slice(0, end + 1).join(' '), locality: words.slice(end + 1).join(' ') });
    } else if (words.length > 1) {
      readings.push({ street: words[0], locality: words.slice(1).join(' ') });
      readings.push({ street: words[words.length - 1], locality: words.slice(0, -1).join(' ') });
    }
    readings.push({ street: parts[0] });
  }
  return { postcode, number: number?.replace(/\s+/g, ''), readings };
}

async function findStreets({ street, locality }, postcode) {
  const url = new URL(STREETS_URL);
  url.searchParams.set('name', streetPattern(street));
  if (locality) url.searchParams.set('locality', locality);
  if (postcode) url.searchParams.set('postalCode', postcode);
  url.searchParams.set('pageSize', '10');
  const res = await fetch(url, { signal: AbortSignal.timeout(4000), cache: 'no-store' });
  if (!res.ok) return { streets: [], total: 0 };
  return { streets: await res.json(), total: Number(res.headers.get('x-total-count')) || 0 };
}

const fullName = (name) => name.replace(/Str\.$/, 'Straße').replace(/str\.$/, 'straße');

const respond = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request) {
  // Only for our own pages.
  if (['cross-site', 'same-site'].includes(request.headers.get('sec-fetch-site'))) return respond({ results: [] }, 403);

  const q = (new URL(request.url).searchParams.get('q') || '').slice(0, 120);
  const { postcode, number, readings } = parseQuery(q);

  try {
    for (const reading of readings) {
      if ((reading.street.match(/\p{L}/gu) || []).length < 3) continue;
      // eslint-disable-next-line no-await-in-loop
      const { streets, total } = await findStreets(reading, postcode);
      if (streets.length) {
        const labels = streets.map((s) => `${s.postalCode} ${s.locality}, ${fullName(s.name)}`);
        const results = [...new Set(labels)].slice(0, MAX_RESULTS).map((label) => ({ label }));
        return respond({ results, number, more: total > results.length });
      }
    }
    return respond({ results: [] });
  } catch {
    return respond({ results: [] });
  }
}
