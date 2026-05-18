'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from '../../components/ThemeProvider';

const STATUS_OPTIONS = [
  { value: 'offen', label: 'Offen', color: '#9ca3af' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung', color: '#c9a24a' },
  { value: 'abgelehnt', label: 'Abgelehnt', color: '#dc3c3c' },
  { value: 'versichert', label: 'Versichert', color: '#4a9e6a' },
];

function AdminContent() {
  const { theme, toggle } = useTheme();
  const [authState, setAuthState] = useState('checking'); // checking | login | authed
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.status === 401) {
        setAuthState('login');
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setAuthState('authed');
    } catch {
      setAuthState('login');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || 'Login fehlgeschlagen');
        return;
      }
      setPassword('');
      await load();
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setSubmissions([]);
    setAuthState('login');
  };

  const updateFields = async (id, patch) => {
    // Optimistic update — patch one or multiple fields at once.
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
    try {
      await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch {
      // On error, reload to sync state
      load();
    }
  };

  const updateField = (id, field, value) => updateFields(id, { [field]: value });

  const deleteSubmission = async (id) => {
    if (!confirm('Diesen Eintrag wirklich löschen?')) return;
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  };

  // Re-runs the notification pipeline server-side. Updates the row from
  // the response so the badge flips immediately on success.
  const resendNotification = async (id) => {
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, _resending: true } : s));
    try {
      const res = await fetch(`/api/submissions/${id}/resend-notification`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setSubmissions((prev) => prev.map((s) => s.id === id
          ? { ...s, notification_sent_at: new Date().toISOString(), notification_last_error: null, _resending: false }
          : s));
      } else {
        setSubmissions((prev) => prev.map((s) => s.id === id
          ? { ...s, notification_last_error: data.error || 'Versand fehlgeschlagen', _resending: false }
          : s));
        alert('Versand fehlgeschlagen: ' + (data.error || 'unbekannt'));
      }
    } catch (err) {
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, _resending: false } : s));
      alert('Versand fehlgeschlagen: ' + (err?.message || 'Netzwerkfehler'));
    }
  };

  const handleExport = () => {
    window.location.href = '/api/submissions/export';
  };

  // ─── Filter ───
  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'alle' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${s.name || ''} ${s.email || ''} ${s.telefon || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const pendingNotifications = submissions.filter((s) => !s.notification_sent_at).length;

  // ─── Render: Checking ───
  if (authState === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Lade...</div>
      </div>
    );
  }

  // ─── Render: Login ───
  if (authState === 'login') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <form onSubmit={handleLogin} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 40,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <img
            src={theme === 'dark' ? '/logo-white.svg?v=2' : '/logo-black.svg'}
            alt="Marco Arpa"
            style={{ height: 60, width: 'auto', margin: '0 auto' }}
          />
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--text-primary)',
            textAlign: 'center',
            margin: 0,
          }}>Admin-Bereich</h1>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-body)',
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {loginError && (
            <div style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(220,60,60,0.1)',
              border: '1px solid rgba(220,60,60,0.3)',
              color: '#dc3c3c',
              fontSize: 14,
            }}>{loginError}</div>
          )}
          <button type="submit" disabled={loginLoading || !password} style={{
            padding: '14px',
            background: loginLoading || !password ? 'var(--text-dim)' : 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            border: 'none',
            borderRadius: 10,
            color: 'var(--bg-primary)',
            fontWeight: 700,
            fontSize: 16,
            cursor: loginLoading || !password ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>{loginLoading ? 'Prüfe...' : 'Anmelden'}</button>
        </form>
      </div>
    );
  }

  // ─── Render: Authed — Submissions list ───
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-body)' }}>
      {/* Header */}
      <nav style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src={theme === 'dark' ? '/logo-white.svg?v=2' : '/logo-black.svg'}
              alt="Marco Arpa"
              style={{ height: 47, width: 'auto' }}
            />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Admin</span>
            <button onClick={toggle} aria-label="Theme wechseln" style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)',
              border: '1px solid var(--border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
            }}>{theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
            <button onClick={handleLogout} style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>Abmelden</button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}>Fragebogen-Einsendungen</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              {filtered.length} {filtered.length === 1 ? 'Eintrag' : 'Einträge'}
              {filtered.length !== submissions.length && ` (von ${submissions.length})`}
            </p>
            {pendingNotifications > 0 && (
              <div style={{
                marginTop: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: 'rgba(220,60,60,0.10)',
                border: '1px solid rgba(220,60,60,0.35)',
                borderRadius: 8,
                color: '#dc3c3c',
                fontSize: 13,
                fontWeight: 600,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {pendingNotifications} {pendingNotifications === 1 ? 'Eintrag' : 'Einträge'} ohne Mail-Versand
              </div>
            )}
          </div>
          <button onClick={handleExport} style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            border: 'none',
            borderRadius: 10,
            color: 'var(--bg-primary)',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel Export
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Suche (Name, E-Mail, Telefon)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '10px 16px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-body)',
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{
            padding: '10px 16px',
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-body)',
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
            cursor: 'pointer',
          }}>
            <option value="alle">Alle Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Lade...</div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 60,
            color: 'var(--text-muted)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            {submissions.length === 0 ? 'Noch keine Einsendungen.' : 'Keine Einträge mit diesen Filtern.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((s) => (
              <SubmissionCard
                key={s.id}
                submission={s}
                expanded={expandedId === s.id}
                onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                onUpdate={(field, value) => updateField(s.id, field, value)}
                onUpdateMany={(patch) => updateFields(s.id, patch)}
                onDelete={() => deleteSubmission(s.id)}
                onResendNotification={() => resendNotification(s.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Compute provision from monthly premium + insurer.
// Formula: Monatsbeitrag * rate - 0.10  (Excel-Konvention: "-10%" = -0,10).
// Münchener Verein → 7.8, otherwise → 6.8.
// Returns a number rounded to 2 decimals, or null if monatsbeitrag is not a finite number.
function computeProvision(monatsbeitrag, gesellschaft) {
  const mb = typeof monatsbeitrag === 'number' ? monatsbeitrag : parseFloat(monatsbeitrag);
  if (!Number.isFinite(mb)) return null;
  const isMV = typeof gesellschaft === 'string' && gesellschaft.trim().toLowerCase() === 'münchener verein';
  const rate = isMV ? 7.8 : 6.8;
  return Math.round((mb * rate - 0.10) * 100) / 100;
}

function SubmissionCard({ submission: s, expanded, onToggle, onUpdate, onUpdateMany, onDelete, onResendNotification }) {
  const statusOpt = STATUS_OPTIONS.find((o) => o.value === s.status) || STATUS_OPTIONS[0];
  const createdAt = s.created_at ? new Date(s.created_at) : null;
  const notificationSentAt = s.notification_sent_at ? new Date(s.notification_sent_at) : null;
  const mailDelivered = !!s.notification_sent_at;

  const fields = [
    ['Anschrift', s.anschrift],
    ['Geburtsdatum', s.geburtsdatum],
    ['Familienstand', s.familienstand],
    ['Beruf', s.beruf],
    ['Krankenversicherung', s.versicherungsart],
    ['Krankenkasse', s.krankenkasse],
    ['Kassenwechsel', s.wechsel],
    ['Bonusprogramm', s.bonusprogramm],
    ['Behandlung', s.behandlung],
    ['Heil- und Kostenplan', s.heilkostenplan],
    ['Fehlende Zähne', s.fehlende_zaehne],
    ['Zahnlücke mitversichern', s.zahnluecke],
    ['Parodontose', s.parodontose],
    ['Wichtiger Bereich', s.schwerpunkt, true],
    ['Vorherige Zahnversicherung', s.vorherige_versicherung],
    ['Kontaktweg', s.kontaktweg, true],
    ['Zusatzversicherung', s.zusatzversicherung, true],
    ['Beratungstermin', s.beratungstermin, true],
  ];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Summary row */}
      <div style={{
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr auto auto',
        gap: 16,
        alignItems: 'center',
      }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: 999,
          background: statusOpt.color + '22',
          color: statusOpt.color,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          minWidth: 130,
          textAlign: 'center',
          boxSizing: 'border-box',
        }}>{statusOpt.label}</span>
        <span
          title={mailDelivered
            ? `Mail an Marco versandt: ${notificationSentAt ? notificationSentAt.toLocaleString('de-DE') : ''}`
            : `Mail noch nicht versandt${s.notification_attempts ? ` · ${s.notification_attempts} Versuche` : ''}`}
          aria-label={mailDelivered ? 'Mail versandt' : 'Mail nicht versandt'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%',
            background: mailDelivered ? 'rgba(74,158,106,0.12)' : 'rgba(220,60,60,0.12)',
            border: `1px solid ${mailDelivered ? 'rgba(74,158,106,0.45)' : 'rgba(220,60,60,0.45)'}`,
            color: mailDelivered ? '#4a9e6a' : '#dc3c3c',
            flexShrink: 0,
          }}
        >
          {mailDelivered
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.name || '(Kein Name)'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.email} {s.telefon ? `· ${s.telefon}` : ''}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'right', whiteSpace: 'nowrap' }}>
          {createdAt ? createdAt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}<br />
          {createdAt ? createdAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
        <button onClick={onToggle} style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 14px',
          color: 'var(--text-body)',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>{expanded ? 'Schließen' : 'Details'}</button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
          {/* Editable fields — core row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <EditableField label="Status">
              <select
                value={s.status}
                onChange={(e) => onUpdate('status', e.target.value)}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </EditableField>
            <EditableField label="Provision">
              <input
                key={`prov-${s.id}-${s.provision ?? 'null'}`}
                type="number"
                step="0.01"
                defaultValue={s.provision ?? ''}
                onBlur={(e) => onUpdate('provision', e.target.value === '' ? null : parseFloat(e.target.value))}
                style={inputStyle}
              />
            </EditableField>
            <EditableField label="Monatsbeitrag">
              <input
                type="number"
                step="0.01"
                defaultValue={s.monatsbeitrag ?? ''}
                onBlur={(e) => {
                  const raw = e.target.value;
                  const mb = raw === '' ? null : parseFloat(raw);
                  // Auto-calc provision from monatsbeitrag + current gesellschaft.
                  const provision = mb == null ? s.provision : computeProvision(mb, s.gesellschaft);
                  onUpdateMany({ monatsbeitrag: mb, provision });
                }}
                style={inputStyle}
              />
            </EditableField>
            <EditableField label="Grund">
              <input
                type="text"
                defaultValue={s.grund ?? ''}
                onBlur={(e) => onUpdate('grund', e.target.value)}
                style={inputStyle}
              />
            </EditableField>
            <EditableField label="Gesellschaft">
              <input
                type="text"
                defaultValue={s.gesellschaft ?? ''}
                onBlur={(e) => {
                  const ges = e.target.value;
                  // Re-calc provision if monatsbeitrag is set — the rate depends on insurer.
                  if (s.monatsbeitrag != null) {
                    onUpdateMany({ gesellschaft: ges, provision: computeProvision(s.monatsbeitrag, ges) });
                  } else {
                    onUpdate('gesellschaft', ges);
                  }
                }}
                style={inputStyle}
              />
            </EditableField>
          </div>

          {/* Editable fields — Vertragsstatus-Flags */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <EditableField label="Alt-Vertrag gekündigt">
              <BoolSelect
                value={s.alt_vertrag_gekuendigt}
                onChange={(v) => onUpdate('alt_vertrag_gekuendigt', v)}
              />
            </EditableField>
            <EditableField label="Kündigungsbestätigung erhalten">
              <BoolSelect
                value={s.kuendigungsbestaetigung_erhalten}
                onChange={(v) => onUpdate('kuendigungsbestaetigung_erhalten', v)}
              />
            </EditableField>
            <EditableField label="Neue Vertragsunterlagen erhalten">
              <BoolSelect
                value={s.neue_vertragsunterlagen_erhalten}
                onChange={(v) => onUpdate('neue_vertragsunterlagen_erhalten', v)}
              />
            </EditableField>
          </div>

          <EditableField label="Notizen">
            <textarea
              defaultValue={s.notizen ?? ''}
              onBlur={(e) => onUpdate('notizen', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
            />
          </EditableField>

          {/* Read-only fields */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {fields.map(([label, value, multi]) => {
              const items = multi && typeof value === 'string' ? splitMulti(value) : null;
              const isList = items && items.length > 1;
              return (
                <div key={label} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isList ? 6 : 2,
                  ...(multi ? { gridColumn: '1 / -1' } : {}),
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
                  {isList ? (
                    <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {items.map((item, i) => (
                        <li key={i} style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5 }}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ fontSize: 14, color: 'var(--text-body)', wordBreak: 'break-word' }}>{value || '—'}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Notification status */}
          <div style={{
            marginTop: 24,
            padding: '14px 18px',
            background: mailDelivered ? 'rgba(74,158,106,0.06)' : 'rgba(220,60,60,0.06)',
            border: `1px solid ${mailDelivered ? 'rgba(74,158,106,0.25)' : 'rgba(220,60,60,0.25)'}`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontSize: 12, color: 'var(--text-dim)',
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
              }}>
                E-Mail-Benachrichtigung
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5 }}>
                {mailDelivered ? (
                  <>An Marco versandt {notificationSentAt ? `am ${notificationSentAt.toLocaleString('de-DE')}` : ''}</>
                ) : (
                  <>
                    Noch nicht versandt.
                    {s.notification_attempts ? ` ${s.notification_attempts} Versuche.` : ''}
                    {s.notification_last_error ? (
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 12, marginTop: 2 }}>
                        Letzter Fehler: {s.notification_last_error}
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </div>
            {!mailDelivered && (
              <button
                onClick={onResendNotification}
                disabled={s._resending}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: 'var(--bg-primary)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: s._resending ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: s._resending ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {s._resending ? 'Sende…' : 'Mail erneut senden'}
              </button>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onDelete} style={{
              background: 'transparent',
              border: '1px solid rgba(220,60,60,0.3)',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#dc3c3c',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}>Eintrag löschen</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Tri-state select for nullable booleans: null | true | false.
// Stored as ' ' / 'true' / 'false' in the <select>; converted back on change.
function BoolSelect({ value, onChange }) {
  const current = value === true ? 'true' : value === false ? 'false' : '';
  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? null : v === 'true');
      }}
      style={inputStyle}
    >
      <option value="">—</option>
      <option value="true">Ja</option>
      <option value="false">Nein</option>
    </select>
  );
}

function EditableField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      {children}
    </label>
  );
}

// Split a comma-joined multi-select value into individual items,
// respecting parentheses so e.g. "foo (a, b), bar" stays two items.
function splitMulti(value) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') { depth++; current += ch; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); current += ch; continue; }
    if (ch === ',' && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--input-bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-body)',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
};

export default function AdminPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="marco-admin-theme">
      <AdminContent />
    </ThemeProvider>
  );
}
