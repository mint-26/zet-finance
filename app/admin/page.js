'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider, useTheme } from '../../components/ThemeProvider';
import { formatBirthdate } from '../../lib/format';
import { istFokus, fokusTarife, berechneBeitrag, euro } from '../../lib/tarife';
import { GKV, PKV } from '../../lib/insurers';
import {
  KV, KV_BY_VALUE, ERWERBSSTATUS, KONTAKTWEG, JA_NEIN, BEHANDLUNG, FEHLENDE_ZAEHNE, PARODONTOSE, SCHWERPUNKT,
  BEIHILFE, WECHSEL, GESCHLECHT, FAMILIENSTAND, splitMulti, krankenkasseText, NICHT_IN_LISTE,
} from '../../lib/fragebogen';
import InsurerSelect from '../../components/InsurerSelect';
import Auswertung from '../../components/admin/Auswertung';
import Dokumente from '../../components/admin/Dokumente';
import Backup from '../../components/admin/Backup';
import { selectLook, STATUS_OPTIONS, pillColors } from '../../components/admin/ui';
import { PeriodTabs, MonthTabs, MonthPanel, inPeriod, periodLabel, yearsOf, groupByMonth, leadDate, monthKeyOf, Chevron } from '../../components/admin/Periods';
import { GESELLSCHAFTEN } from '../../lib/gesellschaften';

// Where a lead came from (column `quelle`). WhatsApp tests come from the bot preview.
const QUELLE_LABELS = { web: 'Website', whatsapp: 'WhatsApp', whatsapp_test: 'WhatsApp (Test)' };

const ABLEHNUNGSGRUND_OPTIONS = ['mehr als 4 fehlende Zähne', 'Bonität'];

const headerBtn = {
  padding: '12px 24px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

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
  const [quelleFilter, setQuelleFilter] = useState('alle');
  const [expandedId, setExpandedId] = useState(null);
  const [period, setPeriod] = useState({ period: String(new Date().getFullYear()), von: '', bis: '' });
  // undefined: nothing chosen yet, the newest month is shown. null: closed by the user.
  const [selectedMonth, setSelectedMonth] = useState(undefined);
  const [documentChanges, setDocumentChanges] = useState(0);
  const [documentUsage, setDocumentUsage] = useState(null);
  const [followId, setFollowId] = useState(null);

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

  // Storage in use and number of documents per lead.
  useEffect(() => {
    if (authState !== 'authed') return undefined;
    let stale = false;
    fetch('/api/dokumente')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!stale && data) setDocumentUsage(data); })
      .catch(() => {});
    return () => { stale = true; };
  }, [authState, documentChanges]);

  // A lead that just moved to another month: bring it into view once its month is open.
  useEffect(() => {
    if (!followId) return undefined;
    const timer = setTimeout(() => {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(`lead-${followId}`)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      setFollowId(null);
    }, 400);
    return () => clearTimeout(timer);
  }, [followId]);

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

  const followLead = (lead) => {
    const date = new Date(leadDate(lead));
    if (!inPeriod(lead, period)) setPeriod({ ...period, period: String(date.getFullYear()) });
    setSelectedMonth(monthKeyOf(date));
    setFollowId(lead.id);
  };

  // From the Auswertung: show one customer in the list, opened, whatever the filters were.
  const openLead = (lead) => {
    setSearch('');
    setStatusFilter('alle');
    setQuelleFilter('alle');
    setExpandedId(lead.id);
    followLead(lead);
  };

  const updateFields = async (id, patch) => {
    // Optimistic update — patch one or multiple fields at once.
    const changes = { ...patch };
    const current = submissions.find((s) => s.id === id);
    // Closing a customer or bringing them back, or undoing it, moves the lead to another month:
    // the view goes along.
    if (current && 'status' in patch && (current.status === 'versichert') !== (patch.status === 'versichert')) {
      changes.abgeschlossen_am = patch.status === 'versichert' ? new Date().toISOString() : null;
      followLead({ ...current, ...changes });
    }
    if (current && 'wieder_aktiv' in patch) {
      delete changes.wieder_aktiv;
      changes.wieder_aktiv_am = patch.wieder_aktiv ? new Date().toISOString() : null;
      followLead({ ...current, ...changes });
    }
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...changes } : s));
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) { load(); return false; }
      // The server's dates count.
      const { ok, ...dates } = await res.json().catch(() => ({}));
      if (Object.keys(dates).length) {
        setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, ...dates } : s));
      }
      return true;
    } catch {
      // On error, reload to sync state
      load();
      return false;
    }
  };

  const updateField = (id, field, value) => updateFields(id, { [field]: value });

  const deleteSubmission = async (id) => {
    if (!confirm('Diesen Eintrag und alle seine Dokumente wirklich löschen?')) return;
    const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) {
      alert('Der Eintrag konnte nicht gelöscht werden. Bitte noch einmal versuchen.');
      return;
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setDocumentChanges((n) => n + 1);
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

  const changePeriod = (next) => {
    setPeriod(next);
    setSelectedMonth(undefined);
  };

  // ─── Filter ───
  // A search looks through all years, so nobody gets lost in the wrong period.
  const searching = search.trim() !== '';
  const inSelectedPeriod = submissions.filter((s) => inPeriod(s, period));
  const filtered = (searching ? submissions : inSelectedPeriod).filter((s) => {
    if (statusFilter !== 'alle' && s.status !== statusFilter) return false;
    if (quelleFilter === 'web' && s.quelle && s.quelle !== 'web') return false;
    if (quelleFilter === 'whatsapp' && !(s.quelle || '').startsWith('whatsapp')) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${s.name || ''} ${s.email || ''} ${s.telefon || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const pendingNotifications = submissions.filter((s) => !s.notification_sent_at).length;

  const months = groupByMonth(filtered);
  // A month the current filters no longer contain falls back to the newest one.
  const activeMonth = selectedMonth === null ? null : (months.find((m) => m.key === selectedMonth) || months[0] || null);
  const toggleMonth = (key) => setSelectedMonth(activeMonth?.key === key ? null : key);

  const leadCards = (rows) => rows.map((s) => (
    <SubmissionCard
      key={s.id}
      submission={s}
      tarifOptions={tarifOptions}
      documentCount={documentUsage?.proLead?.[s.id] || 0}
      onDocumentsChanged={() => setDocumentChanges((n) => n + 1)}
      expanded={expandedId === s.id}
      onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
      onUpdate={(field, value) => updateField(s.id, field, value)}
      onUpdateMany={(patch) => updateFields(s.id, patch)}
      onDelete={() => deleteSubmission(s.id)}
      onResendNotification={() => resendNotification(s.id)}
    />
  ));

  // Tariffs already entered per insurer, offered as suggestions next to Marco's list.
  const tarifOptions = useMemo(() => {
    const options = {};
    GESELLSCHAFTEN.forEach((g) => { options[g.name] = new Set(g.tarife); });
    submissions.forEach((s) => {
      const tarif = (s.tarif || '').trim();
      if (s.gesellschaft && tarif) (options[s.gesellschaft] ||= new Set()).add(tarif);
    });
    return options;
  }, [submissions]);

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
            src={theme === 'dark' ? '/logo-white.svg?v=7' : '/logo-black.svg?v=7'}
            alt="Marco Arpa"
            style={{ height: 59, width: 'auto', margin: '6.5px auto' }}
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
              src={theme === 'dark' ? '/logo-white.svg?v=7' : '/logo-black.svg?v=7'}
              alt="Marco Arpa"
              style={{ height: 46, width: 'auto', margin: '5px 0' }}
            />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/admin/whatsapp" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>WhatsApp-Bot testen</a>
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
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(24px, 3vw, 34px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}>Fragebogen-Einsendungen</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              {filtered.length} {filtered.length === 1 ? 'Eintrag' : 'Einträge'}
              {filtered.length !== submissions.length && ` (von ${submissions.length})`}
              {searching && ', Suche über alle Jahre'}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 }}>
            <Backup
              submissions={submissions}
              usage={documentUsage}
              buttonStyle={{ ...headerBtn, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
            />
            <button onClick={handleExport} style={{
              ...headerBtn,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              border: '1px solid transparent',
              color: 'var(--bg-primary)',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel Export
            </button>
          </div>
        </div>

        {/* Search first: it looks through all years, so it sits above the period bar. */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <label style={{ position: 'relative', flex: '0 1 520px', minWidth: 240, display: 'flex' }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 18, top: '50%', marginTop: -10, color: 'var(--text-muted)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="search"
              aria-label="Kunden suchen"
              placeholder="Kunden suchen: Name, E-Mail oder Telefon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', height: 56, padding: '0 18px 0 50px', appearance: 'none', WebkitAppearance: 'none',
                background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 12,
                color: 'var(--text-primary)', fontSize: 16, fontFamily: "'DM Sans', sans-serif",
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status" style={filterSelect}>
            <option value="alle" style={optionStyle}>Alle Status</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={optionStyle}>{o.label}</option>
            ))}
          </select>
          <select value={quelleFilter} onChange={(e) => setQuelleFilter(e.target.value)} aria-label="Quelle" style={filterSelect}>
            <option value="alle" style={optionStyle}>Alle Quellen</option>
            <option value="web" style={optionStyle}>Website</option>
            <option value="whatsapp" style={optionStyle}>WhatsApp</option>
          </select>
        </div>

        <PeriodTabs years={yearsOf(submissions)} value={period} onChange={changePeriod} />

        <Auswertung rows={inSelectedPeriod} allRows={submissions} periodText={periodLabel(period)} onOpenLead={openLead} />

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
          searching ? (
            // A search shows every hit at once, sorted under its month.
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {months.map((month) => (
                <section key={month.key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h2 style={{ margin: '8px 0 0', fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>{month.label}</h2>
                  {leadCards(month.rows)}
                </section>
              ))}
            </div>
          ) : (
            <>
              <MonthTabs months={months} activeKey={activeMonth?.key} onToggle={toggleMonth} />
              <MonthPanel monthKey={activeMonth?.key}>
                {activeMonth && leadCards(activeMonth.rows)}
              </MonthPanel>
            </>
          )
        )}
      </main>

      <style jsx global>{`
        .crm-month { animation: crmMonthIn 0.3s ease; }
        @keyframes crmMonthIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .crm-month { animation: none; } .crm-tile, .crm-tile * { transition: none !important; } }
        .crm-months { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 6px; }
        .crm-status-box { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; }
        @media (max-width: 560px) { .crm-status-box { flex-direction: column; align-items: flex-start; gap: 5px; } }
        @media (max-width: 900px) { .crm-months { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .crm-months { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .crm-controls { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 14px 12px; margin-bottom: 20px; }
        .crm-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px 24px; align-items: start; }
        main select:focus, main input:focus, main textarea:focus, main button[aria-haspopup]:focus {
          outline: none; border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-dim);
        }
        main input[list]::-webkit-calendar-picker-indicator { display: none !important; }
        @media (max-width: 860px) {
          .crm-two { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 600px) {
          .crm-field { flex-basis: 100% !important; max-width: none !important; }
        }
      `}</style>
    </div>
  );
}

function SubmissionCard({ submission: s, tarifOptions, documentCount, onDocumentsChanged, expanded, onToggle, onUpdate, onUpdateMany, onDelete, onResendNotification }) {
  const statusOpt = STATUS_OPTIONS.find((o) => o.value === s.status) || STATUS_OPTIONS[0];
  const createdAt = s.created_at ? new Date(s.created_at) : null;
  const closedAt = s.abgeschlossen_am ? new Date(s.abgeschlossen_am) : null;
  const backAt = s.wieder_aktiv_am ? new Date(s.wieder_aktiv_am) : null;
  // Customers set to "Versichert" move by themselves, and so does the ring chart with them.
  const canBringBack = s.status !== 'versichert' && monthKeyOf(new Date(leadDate(s))) !== monthKeyOf(new Date());
  const canUndoBack = s.status !== 'versichert' && !!backAt;
  const shortDate = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const notificationSentAt = s.notification_sent_at ? new Date(s.notification_sent_at) : null;
  const mailDelivered = !!s.notification_sent_at;

  const viaWhatsApp = (s.quelle || '').startsWith('whatsapp');
  const isGespraech = s.anfrage_typ === 'gespraech';

  // A conversation request from WhatsApp only has name, number and topic.
  const fields = isGespraech ? [
    ['Telefon / WhatsApp', s.telefon],
    ['Anliegen', s.anliegen],
  ] : [
    ['E-Mail', s.email],
    ['Telefon', s.telefon],
    ['Anschrift', s.anschrift],
    ['Geburtsdatum', formatBirthdate(s.geburtsdatum)],
    ['Geschlecht', s.geschlecht],
    ['Familienstand', s.familienstand],
    ['Beruf', s.beruf],
    ['Erwerbsstatus', s.erwerbsstatus],
    ['Beihilfe', s.beihilfe],
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
    <div id={`lead-${s.id}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      scrollMarginTop: 16,
    }}>
      {/* Summary row: a click anywhere opens or closes the details, except on its own controls
          and while text is being selected (e.g. to copy a name). */}
      <div
        className="crm-lead-row"
        onClick={(e) => {
          if (e.target.closest('select, button, a, input, textarea, label')) return;
          if (window.getSelection()?.toString()) return;
          onToggle();
        }}
        style={{
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
      }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: 999,
          ...pillColors(statusOpt.value),
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          width: 140,
          flexShrink: 0,
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
        {/* Fixed name width: the details after it start at the same place in every row. */}
        <div style={{ flex: '0 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {/* The name is the keyboard way to open the details; the mouse can click the whole row. */}
            <button type="button" onClick={onToggle} aria-expanded={expanded} style={{
              background: 'none', border: 0, padding: 0, cursor: 'pointer', minWidth: 0, textAlign: 'left',
              font: 'inherit', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {s.name || '(Kein Name)'}
            </button>
            {viaWhatsApp && <Tag color="#25a35a">{QUELLE_LABELS[s.quelle]}</Tag>}
            {isGespraech && <Tag color="#7D6D49">Gespräch</Tag>}
            {documentCount > 0 && (
              <span
                role="img"
                title={`${documentCount} ${documentCount === 1 ? 'Dokument' : 'Dokumente'} hinterlegt`}
                aria-label={`${documentCount} ${documentCount === 1 ? 'Dokument' : 'Dokumente'} hinterlegt`}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                {documentCount}
              </span>
            )}
          </div>
        </div>
        {/* Abgerechnet: a pill in the style of the status, the whole pill is the dropdown. */}
        <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, width: 168 }}>
          <span aria-hidden="true" style={{
            position: 'absolute', left: 11, top: '50%', marginTop: -4, width: 8, height: 8, borderRadius: '50%',
            background: pillColors(s.abgerechnet ? 'versichert' : 'abgelehnt').color, pointerEvents: 'none',
          }} />
          <select
            value={s.abgerechnet ? 'true' : 'false'}
            onChange={(e) => onUpdate('abgerechnet', e.target.value === 'true')}
            aria-label="Abgerechnet"
            style={{
              ...selectLook, width: '100%', height: 30, padding: '0 28px 0 26px', borderRadius: 999,
              backgroundPosition: 'right 10px center', backgroundSize: '12px', boxSizing: 'border-box',
              border: pillColors(s.abgerechnet ? 'versichert' : 'abgelehnt').border,
              backgroundColor: pillColors(s.abgerechnet ? 'versichert' : 'abgelehnt').background,
              color: pillColors(s.abgerechnet ? 'versichert' : 'abgelehnt').color,
              fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", outline: 'none',
            }}
          >
            <option value="false" style={{ background: 'var(--bg-card)', color: 'var(--text-body)' }}>Nicht abgerechnet</option>
            <option value="true" style={{ background: 'var(--bg-card)', color: 'var(--text-body)' }}>Abgerechnet</option>
          </select>
        </span>
        <div style={{ fontSize: 12, lineHeight: 1.45, textAlign: 'left', whiteSpace: 'nowrap', width: 150, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {closedAt || backAt ? (
            <>
              <span style={{ display: 'block', color: 'var(--text-body)' }}>{closedAt ? `Abschluss ${shortDate(closedAt)}` : `Wieder aktiv ${shortDate(backAt)}`}</span>
              {createdAt && <span style={{ display: 'block', color: 'var(--text-dim)' }}>Anfrage {shortDate(createdAt)}</span>}
            </>
          ) : createdAt && (
            <>
              <span style={{ display: 'block', color: 'var(--text-body)' }}>Anfrage {shortDate(createdAt)}</span>
              <span style={{ display: 'block', color: 'var(--text-dim)' }}>{createdAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
            </>
          )}
        </div>
        <span aria-hidden="true" style={{ display: 'flex', color: 'var(--text-muted)' }}><Chevron open={expanded} /></span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
          {/* Editable fields, all the same height, as narrow as their content allows */}
          <div className="crm-controls">
            <EditableField label="Status" min={185} max={200}>
              <select
                value={s.status}
                onChange={(e) => {
                  const status = e.target.value;
                  // Ablehnungsgrund ist nur bei "Abgelehnt" relevant — sonst leeren.
                  if (status !== 'abgelehnt' && s.ablehnungsgrund) {
                    onUpdateMany({ status, ablehnungsgrund: null });
                  } else {
                    onUpdate('status', status);
                  }
                }}
                style={selectStyle}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </EditableField>
            {s.status === 'abgelehnt' && (
              <EditableField label="Ablehnungsgrund" min={180} max={220}>
                <select
                  value={s.ablehnungsgrund ?? ''}
                  onChange={(e) => onUpdate('ablehnungsgrund', e.target.value === '' ? null : e.target.value)}
                  style={selectStyle}
                >
                  <option value="">—</option>
                  {ABLEHNUNGSGRUND_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </EditableField>
            )}
            {/* Not a <label>: a click inside the list would also reach the button again. */}
            <div className="crm-field" style={fieldBox(250, 300)}>
              <span style={fieldLabel}>Gesellschaft</span>
              <InsurerSelect
                id={`gesellschaft-${s.id}`}
                items={s.gesellschaft && !GESELLSCHAFTEN.some((g) => g.name === s.gesellschaft) ? [{ name: s.gesellschaft }, ...GESELLSCHAFTEN] : GESELLSCHAFTEN}
                value={s.gesellschaft ?? ''}
                placeholder="Gesellschaft wählen"
                searchLabel="Gesellschaft suchen"
                otherLabel="Keine Auswahl"
                compact
                onSelect={(item) => { if (item.name !== s.gesellschaft) onUpdateMany({ gesellschaft: item.name, tarif: null }); }}
                onChooseOther={() => onUpdateMany({ gesellschaft: null, tarif: null })}
              />
            </div>
            <EditableField label="Tarif" min={istFokus(s.gesellschaft) ? 210 : 160} max={istFokus(s.gesellschaft) ? 250 : 210}>
              {istFokus(s.gesellschaft) ? (
                // Focus insurers: their tariffs from lib/tarife.js. An older hand-typed entry stays selectable.
                <select value={s.tarif ?? ''} onChange={(e) => onUpdate('tarif', e.target.value || null)} style={selectStyle}>
                  <option value="" style={optionStyle}>Tarif wählen</option>
                  {fokusTarife(s.gesellschaft).map((t) => <option key={t} value={t} style={optionStyle}>{t}</option>)}
                  {s.tarif && !fokusTarife(s.gesellschaft).includes(s.tarif) && <option value={s.tarif} style={optionStyle}>{s.tarif} (bisherige Eingabe)</option>}
                </select>
              ) : (<>
              {/* Other insurers: typed by hand. The key resets the field when the insurer changes. */}
              <input
                key={s.gesellschaft ?? ''}
                type="text"
                list={`tarife-${s.id}`}
                defaultValue={s.tarif ?? ''}
                disabled={!s.gesellschaft}
                placeholder={s.gesellschaft ? 'Tarif eintragen' : 'Erst Gesellschaft wählen'}
                onBlur={(e) => { if (e.target.value.trim() !== (s.tarif ?? '')) onUpdate('tarif', e.target.value.trim()); }}
                style={fieldStyle}
              />
              <datalist id={`tarife-${s.id}`}>
                {[...(tarifOptions[s.gesellschaft] || [])].map((o) => <option key={o} value={o} />)}
              </datalist>
              </>)}
            </EditableField>
            {s.gesellschaft && <BeitragFelder s={s} />}
            {(canBringBack || canUndoBack) && (
              <div className="crm-field" style={fieldBox(190, 420)}>
                <span style={fieldLabel}>Kunde meldet sich wieder</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {canBringBack && <button type="button" onClick={() => onUpdateMany({ wieder_aktiv: true })} style={monthBtn}>In aktuellen Monat holen</button>}
                  {canUndoBack && <button type="button" onClick={() => onUpdateMany({ wieder_aktiv: false })} style={monthBtn}>Zurück zum Anfragemonat</button>}
                </div>
              </div>
            )}
          </div>

          <div className="crm-two">
            <EditableField label="Beratungsdokumentation">
              <textarea
                defaultValue={s.notizen ?? ''}
                onBlur={(e) => onUpdate('notizen', e.target.value)}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
              />
            </EditableField>
            <Dokumente submissionId={s.id} onChanged={onDocumentsChanged} />
          </div>

          <KundenAngaben s={s} fields={fields} isGespraech={isGespraech} onSave={onUpdateMany} />

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

// Small label next to the name, e.g. the lead source.
function Tag({ color, children }) {
  return (
    <span style={{
      flexShrink: 0,
      padding: '2px 8px',
      borderRadius: 999,
      border: `1px solid ${color}66`,
      background: color + '1a',
      color,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

const fieldLabel = { fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' };

// Fields grow up to max and then stop, so they stay short on wide screens.
const fieldBox = (min, max) => ({ display: 'flex', flexDirection: 'column', gap: 6, flex: `1 1 ${min}px`, maxWidth: max, minWidth: 0 });

// What Marco can correct by hand, e.g. a misspelt name or a wrong answer. Answers use the same
// options as the questionnaire (lib/fragebogen.js); the server only accepts those.
const opts = (list) => list.map((o) => (typeof o === 'string' ? o : o.value));
const EDIT_GROUPS = [
  { title: 'Persönliches', fields: [
    { key: 'name', label: 'Name' },
    { key: 'anschrift', label: 'Anschrift', wide: true },
    { key: 'geburtsdatum', label: 'Geburtsdatum', type: 'date' },
    { key: 'geschlecht', label: 'Geschlecht', options: GESCHLECHT },
    { key: 'familienstand', label: 'Familienstand', options: FAMILIENSTAND },
    { key: 'kontaktweg', label: 'Kontaktweg', options: KONTAKTWEG, multi: true },
    { key: 'email', label: 'E-Mail', type: 'email' },
    { key: 'telefon', label: 'Telefon', type: 'tel' },
    { key: 'beruf', label: 'Beruf', onlyIfSet: true },
  ] },
  { title: 'Erwerbsstatus und Krankenversicherung', fields: [
    { key: 'erwerbsstatus', label: 'Erwerbsstatus', options: opts(ERWERBSSTATUS) },
    { key: 'beihilfe', label: 'Beihilfe', options: BEIHILFE },
    { key: 'versicherungsart', label: 'Krankenversicherung', options: Object.values(KV).map((k) => k.value) },
    { key: 'krankenkasse', label: 'Krankenkasse', type: 'kasse' },
    { key: 'wechsel', label: 'Kassenwechsel', options: WECHSEL },
    { key: 'bonusprogramm', label: 'Bonusprogramm', options: JA_NEIN },
  ] },
  { title: 'Zahnstatus', fields: [
    { key: 'behandlung', label: 'Behandlung', options: opts(BEHANDLUNG) },
    { key: 'heilkostenplan', label: 'Heil- und Kostenplan', options: JA_NEIN },
    { key: 'fehlende_zaehne', label: 'Fehlende Zähne', options: FEHLENDE_ZAEHNE },
    { key: 'zahnluecke', label: 'Zahnlücke mitversichern', options: JA_NEIN },
    { key: 'parodontose', label: 'Parodontose', options: opts(PARODONTOSE) },
    { key: 'schwerpunkt', label: 'Wichtiger Bereich', options: SCHWERPUNKT, multi: true },
    { key: 'vorherige_versicherung', label: 'Vorherige Zahnversicherung', options: JA_NEIN },
  ] },
];
const EDIT_GROUPS_GESPRAECH = [
  { title: '', fields: [
    { key: 'name', label: 'Name' },
    { key: 'telefon', label: 'Telefon / WhatsApp', type: 'tel' },
    { key: 'anliegen', label: 'Anliegen', wide: true, textarea: true },
  ] },
];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Stored insurer text → what the insurer dropdown shows: a list entry, or a name typed by hand.
function kasseFromText(text, kind) {
  const value = String(text || '').trim();
  if (!value) return { kasse: '', istAndere: false, freitext: '' };
  if (value.endsWith(NICHT_IN_LISTE)) return { kasse: '', istAndere: true, freitext: value.slice(0, -NICHT_IN_LISTE.length) };
  const items = kind === 'gkv' ? GKV : kind === 'pkv' ? PKV : [];
  const entry = items.find((i) => value === i.name || value.startsWith(`${i.name} (`));
  return entry ? { kasse: entry.name, istAndere: false, freitext: '' } : { kasse: '', istAndere: true, freitext: value };
}

function KundenAngaben({ s, fields, isGespraech, onSave }) {
  const groups = (isGespraech ? EDIT_GROUPS_GESPRAECH : EDIT_GROUPS).map((g) => ({
    ...g, fields: g.fields.filter((f) => !f.onlyIfSet || s[f.key]),
  }));
  const editable = groups.flatMap((g) => g.fields);
  const [draft, setDraft] = useState(null);
  const [kasse, setKasse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = draft !== null;
  const editedLabels = new Set(editable.map((f) => f.label).concat('Telefon / WhatsApp', 'Telefon'));
  const kind = editing ? KV_BY_VALUE[draft.versicherungsart]?.kind : null;

  const start = () => {
    setDraft(Object.fromEntries(editable.map((f) => [f.key, s[f.key] ?? ''])));
    setKasse(null);
    setError('');
  };
  const cancel = () => { setDraft(null); setKasse(null); setError(''); };
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  // The insurer dropdown only rewrites the stored text once it was used.
  const kasseState = kasse || kasseFromText(draft?.krankenkasse, kind);
  const changeKasse = (next) => {
    const merged = { ...kasseState, ...next };
    setKasse(merged);
    set('krankenkasse', krankenkasseText({ kind, ...merged }));
  };
  const toggleMulti = (f, option) => {
    const parts = splitMulti(draft[f.key]);
    const next = parts.includes(option) ? parts.filter((p) => p !== option) : [...parts, option];
    const ordered = [...f.options.filter((o) => next.includes(o)), ...next.filter((p) => !f.options.includes(p))];
    set(f.key, ordered.join(', '));
  };

  const save = async () => {
    const changes = {};
    editable.forEach(({ key }) => {
      const value = String(draft[key] ?? '').trim();
      if (value !== String(s[key] ?? '').trim()) changes[key] = value || null;
    });
    if ('name' in changes && !changes.name) { setError('Der Name darf nicht leer sein.'); return; }
    if (changes.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)) { setError('Die E-Mail-Adresse sieht nicht vollständig aus.'); return; }
    if (kasse?.istAndere && !kasse.freitext.trim()) { setError('Bitte den Namen der Krankenkasse eintragen.'); return; }
    if (!Object.keys(changes).length) { cancel(); return; }
    setSaving(true);
    const ok = await onSave(changes);
    setSaving(false);
    if (ok) cancel();
    else setError('Speichern hat nicht geklappt, die alten Angaben sind wiederhergestellt. Bitte noch einmal versuchen.');
  };
  const onKey = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); };

  const control = (f) => {
    const value = draft[f.key] ?? '';
    if (f.multi) {
      const parts = splitMulti(value);
      const extra = parts.filter((p) => !f.options.includes(p));
      return (
        <span role="group" aria-label={f.label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[...f.options, ...extra].map((o) => {
            const on = parts.includes(o);
            return (
              <label key={o} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '0 14px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`, background: on ? 'var(--accent-dim)' : 'var(--input-bg)',
                fontSize: 14, color: 'var(--text-body)',
              }}>
                <input type="checkbox" checked={on} onChange={() => toggleMulti(f, o)} style={{ accentColor: 'var(--accent)', margin: 0 }} />
                {o}
              </label>
            );
          })}
        </span>
      );
    }
    if (f.options) {
      const list = value && !f.options.includes(value) ? [...f.options, value] : f.options;
      return (
        <select value={value} onChange={(e) => set(f.key, e.target.value)} style={selectStyle}>
          <option value="" style={optionStyle}>—</option>
          {list.map((o) => <option key={o} value={o} style={optionStyle}>{o}</option>)}
        </select>
      );
    }
    if (f.type === 'kasse' && (kind === 'gkv' || kind === 'pkv')) {
      return (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <InsurerSelect
            compact items={kind === 'gkv' ? GKV : PKV}
            value={kasseState.kasse} isOther={kasseState.istAndere}
            placeholder={kind === 'gkv' ? 'Krankenkasse auswählen' : 'Krankenversicherer auswählen'}
            searchLabel={kind === 'gkv' ? 'Krankenkasse suchen' : 'Krankenversicherer suchen'}
            onSelect={(item) => changeKasse({ kasse: item.name, istAndere: false, freitext: '' })}
            onChooseOther={() => changeKasse({ kasse: '', istAndere: true })}
          />
          {kasseState.istAndere && (
            <input
              type="text" value={kasseState.freitext} aria-label="Name der Krankenkasse" placeholder="Name eintragen"
              onChange={(e) => changeKasse({ freitext: e.target.value })} onKeyDown={onKey} style={fieldStyle}
            />
          )}
        </span>
      );
    }
    if (f.textarea) return <textarea value={value} onChange={(e) => set(f.key, e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />;
    const type = f.type === 'date' && value && !ISO_DATE.test(value) ? 'text' : (f.type === 'kasse' ? 'text' : f.type || 'text');
    return <input type={type} value={value} onChange={(e) => set(f.key, e.target.value)} onKeyDown={onKey} autoComplete="off" style={fieldStyle} />;
  };

  const shown = fields.filter(([label, value]) => value && !(editing && editedLabels.has(label)));

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <span style={{ ...fieldLabel, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Kundenangaben</span>
        {!editing && <button type="button" onClick={start} style={{ ...monthBtn, height: 36 }}>Bearbeiten</button>}
      </div>

      {editing && (
        <div style={{ marginBottom: 20 }}>
          {groups.map((g) => (
            <div key={g.title} style={{ marginBottom: 20 }}>
              {g.title && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>{g.title}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px 16px' }}>
                {g.fields.map((f) => (
                  <EditableField key={f.key} label={f.label} wide={f.wide || f.multi} as={f.multi || f.type === 'kasse' ? 'div' : 'label'}>
                    {control(f)}
                  </EditableField>
                ))}
              </div>
            </div>
          ))}
          {error && <p role="alert" style={{ margin: '0 0 12px', fontSize: 13, color: '#dc3c3c' }}>{error}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" onClick={save} disabled={saving} style={{ ...monthBtn, background: 'var(--accent)', color: 'var(--bg-primary)', cursor: saving ? 'wait' : 'pointer' }}>
              {saving ? 'Speichert …' : 'Speichern'}
            </button>
            <button type="button" onClick={cancel} disabled={saving} style={{ ...monthBtn, border: '1px solid var(--border)', color: 'var(--text-body)' }}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Empty answers are left out: older leads have many fields that no longer exist. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px 16px' }}>
        {shown.map(([label, value, multi]) => {
          const items = multi && typeof value === 'string' ? splitMulti(value) : null;
          const isList = items && items.length > 1;
          return (
            <div key={label} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isList ? 6 : 2,
              ...(isList ? { gridColumn: '1 / -1' } : {}),
            }}>
              <span style={fieldLabel}>{label}</span>
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
    </div>
  );
}

// Read-only fields next to the tariff: monthly premium from the age and missing teeth, and the
// next age-related change (lib/tarife.js). Recomputed whenever tariff, birth date or teeth change.
function InfoField({ label, value, note, muted, min, max }) {
  return (
    <div className="crm-field" style={fieldBox(min, max)}>
      <span style={fieldLabel}>{label}</span>
      <div style={{
        ...fieldStyle, display: 'flex', alignItems: 'center', background: 'transparent', borderStyle: 'dashed',
        color: muted ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: muted ? 400 : 600,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {note && <span style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--text-dim)' }}>{note}</span>}
    </div>
  );
}

// For insured customers the premium of the contract counts: Marco's own figure from his former
// list (monatsbeitrag) if there is one, otherwise the one saved at closing (beitrag_abschluss).
// Customers without a contract see today's premium.
function BeitragFelder({ s }) {
  const r = berechneBeitrag({ gesellschaft: s.gesellschaft, tarif: s.tarif, geburtsdatum: s.geburtsdatum, fehlendeZaehne: s.fehlende_zaehne });
  const vertrag = s.status === 'versichert' ? (s.monatsbeitrag ?? s.beitrag_abschluss) : null;
  const erhoehung = r.ok && r.naechste;
  const ab = erhoehung && r.naechste.ab.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const erhoehungFeld = r.ok ? (
    <InfoField
      label="Altersbedingte Erhöhung"
      value={erhoehung ? `${r.naechste.mehr > 0 ? '+' : '−'} ${euro(Math.abs(r.naechste.mehr))} ab ${ab}` : 'Keine weitere Altersstufe'}
      note={erhoehung ? `${r.naechste.mehr > 0 ? 'Dann' : 'Senkung auf'} ${euro(r.naechste.beitrag)} mtl., Altersstufe ab ${r.naechste.abAlter}` : null}
      muted={!erhoehung} min={190} max={230}
    />
  ) : <InfoField label="Altersbedingte Erhöhung" value="—" muted min={190} max={230} />;
  if (vertrag != null) {
    const quelle = s.monatsbeitrag != null ? 'aus der bisherigen Liste' : 'bei Abschluss gespeichert';
    const heute = r.ok && r.beitrag !== Number(vertrag) ? `, heute ${euro(r.beitrag)}` : '';
    return (
      <>
        <InfoField label="Beitrag" value={`${euro(Number(vertrag))} mtl.`} note={`Vertrag, ${quelle}${heute}`} min={200} max={260} />
        {erhoehungFeld}
      </>
    );
  }
  if (!r.ok) {
    return (
      <>
        <InfoField label="Beitrag" value={r.grund} muted min={200} max={260} />
        {erhoehungFeld}
      </>
    );
  }
  const zahnText = `${r.zaehne} ${r.zaehne === 1 ? 'fehlender Zahn' : 'fehlende Zähne'}`;
  const note = [
    `Alter ${r.alter}`,
    r.zuschlag > 0 && `inkl. ${euro(r.zuschlag)} Zuschlag, ${zahnText}`,
    r.ohneZuschlagstabelle && `${zahnText}, Zuschlag nicht beziffert`,
  ].filter(Boolean).join(', ');
  return (
    <>
      <InfoField label="Beitrag" value={`${euro(r.beitrag)} mtl.`} note={note} min={200} max={260} />
      {erhoehungFeld}
    </>
  );
}

function EditableField({ label, min, max, wide, as: Tag = 'label', children }) {
  return (
    <Tag className={min ? 'crm-field' : undefined} style={min ? fieldBox(min, max) : { display: 'flex', flexDirection: 'column', gap: 6, ...(wide ? { gridColumn: '1 / -1' } : {}) }}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </Tag>
  );
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

// One height for all fields of a lead, the same as the insurer dropdown.
const fieldStyle = { ...inputStyle, height: 44, padding: '0 12px' };
const selectStyle = { ...fieldStyle, ...selectLook };
const optionStyle = { background: 'var(--select-option-bg)', color: 'var(--text-body)' };
const filterSelect = {
  height: 56, padding: '0 16px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12,
  color: 'var(--text-body)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', ...selectLook,
  paddingRight: 40, backgroundPosition: 'right 14px center',
};
const monthBtn = {
  ...fieldStyle, width: 'auto', background: 'transparent', border: '1px solid var(--accent)',
  color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};

export default function AdminPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="marco-admin-theme">
      <AdminContent />
    </ThemeProvider>
  );
}
