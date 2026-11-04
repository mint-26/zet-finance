'use client';

import { useState, useEffect, useRef } from 'react';
import { selectLook } from './ui';
import { DOKUMENT_ARTEN, ERLAUBTE_ENDUNGEN, MAX_DATEIGROESSE, formatGroesse, mimeVon } from '../../lib/dokumente';

const smallBtn = (danger) => ({
  display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box', textDecoration: 'none',
  minHeight: 36, padding: '0 12px', background: 'transparent', borderRadius: 8, cursor: 'pointer',
  border: `1px solid ${danger ? 'rgba(220,60,60,0.3)' : 'var(--border)'}`,
  color: danger ? '#dc3c3c' : 'var(--text-body)', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
});

const readError = async (res, fallback) => (await res.json().catch(() => ({}))).error || fallback;

// Files of one lead, shown in its details. Upload: the file goes straight to the private
// storage, see app/api/submissions/[id]/dokumente/route.js.
export default function Dokumente({ submissionId, onChanged }) {
  const [dokumente, setDokumente] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [fehler, setFehler] = useState([]);
  const [art, setArt] = useState(DOKUMENT_ARTEN[0]);
  const input = useRef(null);
  const base = `/api/submissions/${submissionId}/dokumente`;

  useEffect(() => {
    let stale = false;
    (async () => {
      try {
        const res = await fetch(base);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!stale) setDokumente(data.dokumente);
      } catch {
        if (!stale) { setDokumente([]); setFehler(['Die Dokumente konnten nicht geladen werden.']); }
      }
    })();
    return () => { stale = true; };
  }, [base]);

  const uploadOne = async (file, fileArt) => {
    const contentType = mimeVon(file.name);
    if (!contentType) throw new Error('Dieser Dateityp ist nicht erlaubt (erlaubt: PDF, Bilder, Word, Excel).');
    if (file.size > MAX_DATEIGROESSE) throw new Error('Die Datei ist größer als 50 MB.');
    if (file.size === 0) throw new Error('Die Datei ist leer.');

    const prepare = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateiname: file.name, groesse: file.size }),
    });
    if (!prepare.ok) throw new Error(await readError(prepare, 'Der Upload konnte nicht vorbereitet werden.'));
    const { pfad, uploadUrl } = await prepare.json();

    const sent = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
    if (!sent.ok) throw new Error('Die Datei konnte nicht hochgeladen werden.');

    const saved = await fetch(base, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ art: fileArt, dateiname: file.name, pfad }),
    });
    if (!saved.ok) throw new Error(await readError(saved, 'Das Dokument konnte nicht gespeichert werden.'));
    return (await saved.json()).dokument;
  };

  const handleFiles = async (files) => {
    setFehler([]);
    // One after the other, so a slow connection is not flooded and errors stay readable.
    for (const file of files) {
      const key = `${file.name}-${Date.now()}`;
      setUploads((prev) => [...prev, { key, name: file.name }]);
      try {
        const dokument = await uploadOne(file, art);
        setDokumente((prev) => [dokument, ...(prev || [])]);
        onChanged?.();
      } catch (err) {
        setFehler((prev) => [...prev, `${file.name}: ${err.message}`]);
      } finally {
        setUploads((prev) => prev.filter((u) => u.key !== key));
      }
    }
  };

  const remove = async (doc) => {
    if (!confirm(`„${doc.dateiname}“ wirklich löschen?`)) return;
    const res = await fetch(`${base}/${doc.id}`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) {
      setFehler([`${doc.dateiname}: Das Dokument konnte nicht gelöscht werden.`]);
      return;
    }
    setDokumente((prev) => prev.filter((d) => d.id !== doc.id));
    onChanged?.();
  };

  const sorted = [...(dokumente || [])].sort((a, b) => DOKUMENT_ARTEN.indexOf(a.art) - DOKUMENT_ARTEN.indexOf(b.art));

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Dokumente</div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {dokumente === null && <p style={{ margin: 0, padding: 14, fontSize: 14, color: 'var(--text-muted)' }}>Lade...</p>}
        {dokumente && sorted.length === 0 && uploads.length === 0 && (
          <p style={{ margin: 0, padding: 14, fontSize: 14, color: 'var(--text-muted)' }}>Noch keine Dokumente hinterlegt.</p>
        )}
        {sorted.map((doc, i) => (
          <div key={doc.id} style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px', padding: '10px 14px',
            borderTop: i === 0 ? 0 : '1px solid var(--border)',
          }}>
            <span style={{
              flexShrink: 0, minWidth: 74, textAlign: 'center', padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: 'var(--accent-dim)', color: 'var(--text-primary)',
            }}>{doc.art}</span>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>{doc.dateiname}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {formatGroesse(Number(doc.groesse))}, {new Date(doc.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <a href={`${base}/${doc.id}`} target="_blank" rel="noopener noreferrer" style={smallBtn(false)}>Öffnen</a>
              <a href={`${base}/${doc.id}?download=1`} style={smallBtn(false)}>Herunterladen</a>
              <button type="button" onClick={() => remove(doc)} aria-label={`${doc.dateiname} löschen`} style={smallBtn(true)}>Löschen</button>
            </div>
          </div>
        ))}
        {uploads.map((u) => (
          <div key={u.key} role="status" style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>
            {u.name} wird hochgeladen …
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <select
          value={art} onChange={(e) => setArt(e.target.value)} aria-label="Art des Dokuments"
          style={{
            height: 40, padding: '0 10px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-body)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", ...selectLook,
          }}
        >
          {DOKUMENT_ARTEN.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          ref={input} type="file" multiple accept={ERLAUBTE_ENDUNGEN} hidden
          onChange={(e) => { const files = [...e.target.files]; e.target.value = ''; handleFiles(files); }}
        />
        <button type="button" onClick={() => input.current?.click()} style={{ ...smallBtn(false), minHeight: 40, fontWeight: 600 }}>
          Datei hochladen
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>PDF, Bilder, Word oder Excel, bis 50 MB</span>
      </div>

      {fehler.length > 0 && (
        <div role="alert" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: '#dc3c3c' }}>
          {fehler.map((f) => <div key={f}>{f}</div>)}
        </div>
      )}
    </div>
  );
}
