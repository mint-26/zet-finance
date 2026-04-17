#!/usr/bin/env node
// Import legacy questionnaire entries from Marco's Google-Sheet export into
// the Supabase `zahnzusatz_submissions` table.
//
// Source sheet: "Antworten 2025 (Neu)" in the xlsx file.
// Dedup via (name + email + created_at) so re-runs don't duplicate.
//
// Usage:
//   node scripts/import-legacy-submissions.mjs --dry-run
//   node scripts/import-legacy-submissions.mjs
//   EXCEL_PATH=/some/other.xlsx node scripts/import-legacy-submissions.mjs
//
// Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY — loaded from .env.local.

import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const DEFAULT_EXCEL = '/Users/adrianlubkowitz/Downloads/Zahnzusatzformular NEU (Antworten)-2.xlsx';
const SHEET_NAME = 'Antworten 2025 (Neu)';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || DRY_RUN;

loadEnvLocal();

const EXCEL_PATH = process.env.EXCEL_PATH || DEFAULT_EXCEL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check .env.local.');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  console.log(`Reading ${EXCEL_PATH}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.getWorksheet(SHEET_NAME);
  if (!ws) {
    console.error(`Sheet "${SHEET_NAME}" not found.`);
    process.exit(1);
  }

  const records = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const rec = parseRow(row);
    if (rec) records.push(rec);
  }

  const byStatus = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`Parsed ${records.length} records. By status:`, byStatus);

  if (VERBOSE) {
    for (const r of records) {
      console.log(
        `  ${r.created_at?.slice(0, 10)}  ${r.status.padEnd(15)}  ` +
          `prov=${r.provision ?? '-'}  mb=${r.monatsbeitrag ?? '-'}  ` +
          `ges=${r.gesellschaft ?? '-'}  ${r.name}`
      );
    }
  }

  if (DRY_RUN) {
    console.log('\nDry run — no DB writes.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pull existing rows once for dedup. Table is tiny (~40 rows), so fetching
  // all is cheaper than 40 round-trips.
  const { data: existing, error: fetchErr } = await supabase
    .from('zahnzusatz_submissions')
    .select('name, email, created_at');
  if (fetchErr) {
    console.error('Failed to fetch existing rows:', fetchErr.message);
    process.exit(1);
  }

  const existingKeys = new Set(
    existing.map((row) => dedupKey(row.name, row.email, row.created_at))
  );

  let inserted = 0;
  let skipped = 0;
  for (const rec of records) {
    const key = dedupKey(rec.name, rec.email, rec.created_at);
    if (existingKeys.has(key)) {
      console.log(`SKIP (exists): ${rec.name} @ ${rec.created_at}`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from('zahnzusatz_submissions').insert(rec);
    if (error) {
      console.error(`Insert failed for ${rec.name}:`, error.message);
      process.exit(1);
    }
    existingKeys.add(key);
    inserted++;
    console.log(`INSERT: ${rec.name} (${rec.status})`);
  }

  console.log(`\nDone. Inserted=${inserted}  Skipped=${skipped}  Total=${records.length}`);
}

// --- Row parsing ---------------------------------------------------------

function parseRow(row) {
  const provVal = cellVal(row.getCell(1)); // "Provision"  (number OR text)
  const grundVal = cellVal(row.getCell(2)); // "Grund"      (actually Monatsbeitrag)
  const gesVal = cellVal(row.getCell(3));
  const tsVal = cellVal(row.getCell(4));
  const nameVal = cellVal(row.getCell(5));

  // Skip wholly empty rows.
  if (str(nameVal) == null && provVal == null && tsVal == null) return null;

  const { status, provision, grundText } = classifyProvision(provVal);
  const monatsbeitrag = toNumber(grundVal);

  return {
    status,
    created_at: toIsoTimestamp(tsVal),
    name: str(nameVal),
    anschrift: str(cellVal(row.getCell(6))),
    geburtsdatum: toIsoDate(cellVal(row.getCell(7))),
    familienstand: str(cellVal(row.getCell(8))),
    telefon: str(cellVal(row.getCell(9))),
    email: str(cellVal(row.getCell(10))),
    beruf: str(cellVal(row.getCell(11))),
    versicherungsart: str(cellVal(row.getCell(12))),
    krankenkasse: str(cellVal(row.getCell(13))),
    wechsel: str(cellVal(row.getCell(14))),
    bonusprogramm: str(cellVal(row.getCell(15))),
    behandlung: str(cellVal(row.getCell(16))),
    heilkostenplan: str(cellVal(row.getCell(17))),
    fehlende_zaehne: toStringOrNull(cellVal(row.getCell(18))),
    zahnluecke: str(cellVal(row.getCell(19))),
    parodontose: str(cellVal(row.getCell(20))),
    schwerpunkt: str(cellVal(row.getCell(21))),
    vorherige_versicherung: str(cellVal(row.getCell(22))),
    kontaktweg: str(cellVal(row.getCell(23))),
    zusatzversicherung: str(cellVal(row.getCell(24))),
    beratungstermin: str(cellVal(row.getCell(25))),
    provision,
    monatsbeitrag,
    gesellschaft: str(gesVal),
    grund: grundText,
  };
}

// Map Provision cell → { status, provision (numeric or null), grundText (Excel text or null) }.
function classifyProvision(val) {
  if (val == null || (typeof val === 'string' && val.trim() === '')) {
    return { status: 'offen', provision: null, grundText: null };
  }
  if (typeof val === 'number') {
    return { status: 'versichert', provision: val, grundText: null };
  }
  const s = String(val).trim();
  const asNum = Number(s.replace(',', '.'));
  if (/^-?\d+([.,]\d+)?$/.test(s) && !Number.isNaN(asNum)) {
    return { status: 'versichert', provision: asNum, grundText: null };
  }

  // Text classification per CHAT_HANDOVER.md mapping table.
  const abgelehntPatterns = [
    /ablehnung/i,
    /kein\s+bedarf/i,
    /keine?\s+interesse/i,
    /direktabschluss/i,
    /nicht\s+versicherbar/i,
    /anderweitig/i,
  ];
  const inBearbeitungPatterns = [
    /k\.?\s*r\.?\b/i,
    /keine\s+rückmeldung/i,
    /angebot\s+erhalten/i,
    /überlegt/i,
  ];

  for (const p of abgelehntPatterns) {
    if (p.test(s)) return { status: 'abgelehnt', provision: null, grundText: s };
  }
  for (const p of inBearbeitungPatterns) {
    if (p.test(s)) return { status: 'in_bearbeitung', provision: null, grundText: s };
  }

  console.warn(`Unrecognized provision text — defaulting to in_bearbeitung: "${s}"`);
  return { status: 'in_bearbeitung', provision: null, grundText: s };
}

// --- Cell helpers --------------------------------------------------------

function cellVal(cell) {
  const v = cell.value;
  if (v == null) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'object') {
    if ('result' in v) return v.result;
    if ('richText' in v) return v.richText.map((r) => r.text).join('');
    if ('text' in v) return v.text;
  }
  return v;
}

function str(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function toStringOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function toNumber(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function toIsoTimestamp(v) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toIsoDate(v) {
  if (v == null) return null;
  if (v instanceof Date) {
    // Use UTC components to avoid TZ drift — the sheet stores dates at 00:00 UTC.
    const yyyy = v.getUTCFullYear();
    const mm = String(v.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(v.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s; // leave as-is if unparseable
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function dedupKey(name, email, createdAt) {
  // Normalize timestamp: Postgres returns e.g. "2025-09-23 15:03:34.738+00"
  // whereas our inserted value is "2025-09-23T15:03:34.738Z". Both are the
  // same instant, so compare via Date.toISOString().
  let ts = '';
  if (createdAt != null) {
    const d = new Date(createdAt);
    ts = Number.isNaN(d.getTime()) ? String(createdAt) : d.toISOString();
  }
  return `${(name ?? '').trim()}||${(email ?? '').trim().toLowerCase()}||${ts}`;
}

// --- .env.local loader ---------------------------------------------------

function loadEnvLocal() {
  const envPath = resolve(PROJECT_ROOT, '.env.local');
  let content;
  try {
    content = readFileSync(envPath, 'utf8');
  } catch {
    return;
  }
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
