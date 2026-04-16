import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getSupabaseAdmin } from '../../../../lib/supabase';
import { isAuthenticated } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

const STATUS_LABELS = {
  offen: 'Offen',
  in_bearbeitung: 'In Bearbeitung',
  versichert: 'Versichert',
};

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
    { header: 'Provision', key: 'provision', width: 12 },
    { header: 'Grund', key: 'grund', width: 14 },
    { header: 'Gesellschaft', key: 'gesellschaft', width: 18 },
    { header: 'Zeitstempel', key: 'zeitstempel', width: 20 },
    { header: 'Vor- und Nachnamen', key: 'name', width: 24 },
    { header: 'Anschrift', key: 'anschrift', width: 34 },
    { header: 'Geburtsdatum', key: 'geburtsdatum', width: 14 },
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
    { header: 'Status', key: 'status', width: 16 },
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
      provision: row.provision,
      grund: row.grund,
      gesellschaft: row.gesellschaft,
      zeitstempel: row.created_at ? new Date(row.created_at) : null,
      name: row.name,
      anschrift: row.anschrift,
      geburtsdatum: row.geburtsdatum,
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
      status: STATUS_LABELS[row.status] || row.status,
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
