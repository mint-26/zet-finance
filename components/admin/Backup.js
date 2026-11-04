'use client';

import { useState } from 'react';
import { createZip } from '../../lib/zip';
import { SPEICHER_KONTINGENT, formatGroesse } from '../../lib/dokumente';

const WARN_AB = 0.8;

const safeName = (text) => String(text || '')
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u001f/\\:*?"<>|]/g, '-')
  .replace(/^\.+/, '')
  .trim()
  .slice(0, 120) || 'Ohne Name';

function folderOf(lead, id) {
  const month = lead?.created_at ? `${new Date(lead.created_at).getFullYear()}-${String(new Date(lead.created_at).getMonth() + 1).padStart(2, '0')} ` : '';
  return safeName(`${month}${lead?.name || 'Lead'} (${id})`);
}

function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Backup button and storage display next to the Excel export. The ZIP is put together in the
// browser, because Vercel functions cannot answer with more than 4.5 MB: Excel list of all
// leads, plus one folder per lead with its documents. A missing file is named in the archive.
export default function Backup({ submissions, usage, buttonStyle }) {
  const [progress, setProgress] = useState(null);
  const running = progress !== null;

  const runBackup = async () => {
    setProgress({ done: 0, total: 0 });
    try {
      const listRes = await fetch('/api/dokumente?backup=1');
      if (!listRes.ok) throw new Error('Die Dokumentenliste konnte nicht geladen werden.');
      const { dokumente } = await listRes.json();
      setProgress({ done: 0, total: dokumente.length });

      const entries = [];
      const missing = [];

      const excel = await fetch('/api/submissions/export').then((r) => (r.ok ? r.blob() : null)).catch(() => null);
      if (excel) entries.push({ name: 'Leads.xlsx', blob: excel });
      else missing.push('Leads.xlsx');

      const leadOf = new Map(submissions.map((s) => [s.id, s]));
      const used = new Set();
      for (let i = 0; i < dokumente.length; i += 1) {
        const doc = dokumente[i];
        const folder = folderOf(leadOf.get(doc.submission_id), doc.submission_id);
        const base = safeName(`${doc.art} - ${doc.dateiname}`);
        const dot = base.lastIndexOf('.');
        let name = `${folder}/${base}`;
        for (let n = 2; used.has(name.toLowerCase()); n += 1) {
          name = `${folder}/${dot > 0 ? `${base.slice(0, dot)} (${n})${base.slice(dot)}` : `${base} (${n})`}`;
        }
        used.add(name.toLowerCase());

        const blob = doc.url ? await fetch(doc.url).then((r) => (r.ok ? r.blob() : null)).catch(() => null) : null;
        if (blob) entries.push({ name, blob });
        else missing.push(name);
        setProgress({ done: i + 1, total: dokumente.length });
      }

      if (missing.length) {
        entries.push({ name: 'FEHLENDE-DATEIEN.txt', blob: new Blob([`Diese Dateien konnten nicht gesichert werden:\n\n${missing.join('\n')}\n`], { type: 'text/plain' }) });
      }
      const zip = await createZip(entries);
      const today = new Date();
      const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      saveFile(zip, `Marco-Arpa-Backup-${stamp}.zip`);
      if (missing.length) alert(`${missing.length} ${missing.length === 1 ? 'Datei konnte' : 'Dateien konnten'} nicht gesichert werden. Die Liste steht im Backup in FEHLENDE-DATEIEN.txt.`);
    } catch (err) {
      alert(`Backup fehlgeschlagen: ${err?.message || 'unbekannter Fehler'}`);
    } finally {
      setProgress(null);
    }
  };

  const share = usage ? usage.belegt / SPEICHER_KONTINGENT : 0;
  const warn = share >= WARN_AB;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
      <button type="button" onClick={runBackup} disabled={running} style={{ ...buttonStyle, cursor: running ? 'wait' : 'pointer', opacity: running ? 0.75 : 1 }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" /></svg>
        {running ? `Backup: ${progress.done} von ${progress.total}` : 'Backup herunterladen'}
      </button>
      {usage && (
        <span style={{ fontSize: 12, color: warn ? '#dc3c3c' : 'var(--text-muted)', fontWeight: warn ? 600 : 400 }}>
          {warn && 'Speicher bald voll: '}{formatGroesse(usage.belegt)} von {formatGroesse(SPEICHER_KONTINGENT)} belegt
        </span>
      )}
    </div>
  );
}
