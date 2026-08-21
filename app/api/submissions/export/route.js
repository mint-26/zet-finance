import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isAuthenticated } from '../../../../lib/auth';
import { formatBirthdate } from '../../../../lib/format';

export const dynamic = 'force-dynamic';

const STATUS_LABELS = {
  offen: 'Offen',
  angebot_verschickt: 'Angebot verschickt',
  abgelehnt: 'Abgelehnt',
  versichert: 'Versichert',
  kein_interesse: 'Kein Interesse',
};

function boolLabel(v) {
  if (v === true) return 'Ja';
  if (v === false) return 'Nein';
  return null;
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('zahnzusatz_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase export error:', error);
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Marco Arpa Admin';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Antworten');

  sheet.columns = [
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Abgerechnet', key: 'abgerechnet', width: 12 },
    { header: 'Ablehnungsgrund', key: 'ablehnungsgrund', width: 24 },
    { header: 'Provision', key: 'provision', width: 12 },
    { header: 'Monatsbeitrag', key: 'monatsbeitrag', width: 14 },
    { header: 'Gesellschaft', key: 'gesellschaft', width: 18 },
    { header: 'Vertrag gekündigt', key: 'alt_vertrag_gekuendigt', width: 20 },
    { header: 'Kündigungsbestätigung erhalten', key: 'kuendigungsbestaetigung_erhalten', width: 28 },
    { header: 'Neue Vertragsunterlagen erhalten', key: 'neue_vertragsunterlagen_erhalten', width: 30 },
    { header: 'Grund', key: 'grund', width: 30 },
    { header: 'Zeitstempel', key: 'zeitstempel', width: 20 },
    { header: 'Vor- und Nachnamen', key: 'name', width: 24 },
    { header: 'Anschrift', key: 'anschrift', width: 34 },
    { header: 'Geburtsdatum', key: 'geburtsdatum', width: 14 },
    { header: 'Geschlecht', key: 'geschlecht', width: 12 },
    { header: 'Familienstand', key: 'familienstand', width: 14 },
    { header: 'Rückrufnummer', key: 'telefon', width: 16 },
    { header: 'E-Mail', key: 'email', width: 28 },
    { header: 'Beruf', key: 'beruf', width: 18 },
    { header: 'Wie Krankenversichert?', key: 'versicherungsart', width: 22 },
    { header: 'Krankenkasse', key: 'krankenkasse', width: 16 },
    { header: 'Kassenwechsel möglich?', key: 'wechsel', width: 22 },
    { header: 'Bonusprogramm', key: 'bonusprogramm', width: 16 },
    { header: 'Aktuelle Behandlung', key: 'behandlung', width: 26 },
    { header: 'Heil- und Kostenplan', key: 'heilkostenplan', width: 22 },
    { header: 'Fehlende Zähne', key: 'fehlende_zaehne', width: 16 },
    { header: 'Zahnlücke mitversichern', key: 'zahnluecke', width: 22 },
    { header: 'Parodontose', key: 'parodontose', width: 14 },
    { header: 'Wichtiger Bereich', key: 'schwerpunkt', width: 30 },
    { header: 'Vorherige Zahnversicherung', key: 'vorherige_versicherung', width: 26 },
    { header: 'Kontaktweg', key: 'kontaktweg', width: 22 },
    { header: 'Zusatzversicherung', key: 'zusatzversicherung', width: 26 },
    { header: 'Beratungstermin', key: 'beratungstermin', width: 22 },
    { header: 'Notizen', key: 'notizen', width: 34 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8E4D8' },
  };

  for (const row of data) {
    sheet.addRow({
      status: STATUS_LABELS[row.status] || row.status,
      abgerechnet: boolLabel(row.abgerechnet),
      ablehnungsgrund: row.ablehnungsgrund,
      provision: row.provision,
      monatsbeitrag: row.monatsbeitrag,
      gesellschaft: row.gesellschaft,
      alt_vertrag_gekuendigt: boolLabel(row.alt_vertrag_gekuendigt),
      kuendigungsbestaetigung_erhalten: boolLabel(row.kuendigungsbestaetigung_erhalten),
      neue_vertragsunterlagen_erhalten: boolLabel(row.neue_vertragsunterlagen_erhalten),
      grund: row.grund,
      zeitstempel: row.created_at ? new Date(row.created_at) : null,
      name: row.name,
      anschrift: row.anschrift,
      geburtsdatum: formatBirthdate(row.geburtsdatum),
      geschlecht: row.geschlecht,
      familienstand: row.familienstand,
      telefon: row.telefon,
      email: row.email,
      beruf: row.beruf,
      versicherungsart: row.versicherungsart,
      krankenkasse: row.krankenkasse,
      wechsel: row.wechsel,
      bonusprogramm: row.bonusprogramm,
      behandlung: row.behandlung,
      heilkostenplan: row.heilkostenplan,
      fehlende_zaehne: row.fehlende_zaehne,
      zahnluecke: row.zahnluecke,
      parodontose: row.parodontose,
      schwerpunkt: row.schwerpunkt,
      vorherige_versicherung: row.vorherige_versicherung,
      kontaktweg: row.kontaktweg,
      zusatzversicherung: row.zusatzversicherung,
      beratungstermin: row.beratungstermin,
      notizen: row.notizen,
    });
  }

  sheet.getColumn('zeitstempel').numFmt = 'dd.mm.yyyy hh:mm';

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `zahnzusatz-antworten-${date}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
