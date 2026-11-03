import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/adresse?q=...  Address suggestions for the questionnaire. Runs through our
// server so the provider (Photon, built on OpenStreetMap) never sees the visitor's IP.
// Queries are not logged. Any failure returns an empty list: suggestions are only a
// help, the address can always be typed by hand.
const PHOTON_URL = 'https://photon.komoot.io/api/';
const GERMANY_BBOX = '5.8,47.2,15.1,55.1';
const MAX_RESULTS = 5;

function toSuggestion({ properties: p }) {
  const street = p.street || (p.type === 'street' ? p.name : null);
  const city = p.city || p.town || p.village || p.district;
  if (!street || !city || !p.postcode) return null;
  const line = p.housenumber ? `${street} ${p.housenumber}` : street;
  return { label: `${p.postcode} ${city}, ${line}`, complete: !!p.housenumber };
}

const empty = (status = 200) => NextResponse.json({ results: [] }, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request) {
  // Only for our own pages; browsers send Origin or Sec-Fetch-Site on these requests.
  if (['cross-site', 'same-site'].includes(request.headers.get('sec-fetch-site'))) return empty(403);

  const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 120);
  if (q.length < 4) return empty();

  const url = new URL(PHOTON_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('lang', 'de');
  url.searchParams.set('limit', '15');
  url.searchParams.set('bbox', GERMANY_BBOX);
  url.searchParams.append('layer', 'house');
  url.searchParams.append('layer', 'street');

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), cache: 'no-store' });
    if (!res.ok) return empty();
    const { features = [] } = await res.json();
    // The box also touches neighbouring countries. The same address can occur several times.
    const seen = new Set();
    const results = features
      .filter((f) => f.properties?.countrycode === 'DE')
      .map(toSuggestion)
      .filter((s) => s && !seen.has(s.label) && seen.add(s.label))
      .slice(0, MAX_RESULTS);
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return empty();
  }
}
