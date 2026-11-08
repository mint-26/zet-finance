'use client';

import { useState, useRef, useEffect } from 'react';
import { useInView } from './useInView';
import SmoothHeight from './SmoothHeight';
import InsurerSelect from './InsurerSelect';
import StreetInput from './StreetInput';
import { GKV, PKV, RATES_AS_OF } from '../lib/insurers';
import {
  KV_BY_VALUE, ERWERBSSTATUS, kvOptions, WANTS_MAIL, WANTS_PHONE, WANTS_WHATSAPP, KONTAKTWEG,
  JA_NEIN, BEHANDLUNG, FEHLENDE_ZAEHNE, PARODONTOSE, SCHWERPUNKT, BEIHILFE, WECHSEL, GESCHLECHT, FAMILIENSTAND,
  krankenkasseText,
} from '../lib/fragebogen';
import { useLang } from './LanguageProvider';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Einführung', 'Zahnstatus', 'Krankenversicherung', 'Persönliche Angaben'];

const EMPTY_FORM = {
  // Step 1
  datenschutz: false,
  // Step 2
  behandlung: '', heilkostenplan: '', fehlendeZaehne: '', zahnluecke: '',
  parodontose: '', schwerpunkt: [], vorherigeVersicherung: '',
  // Step 3. kasse: chosen list entry; kasseIstAndere: "Nicht in der Liste" with free text.
  erwerbsstatus: '', beihilfe: '', versicherungsart: '',
  kasse: '', kasseIstAndere: false, kasseFreitext: '', wechsel: '', bonusprogramm: '',
  // Step 4
  name: '', plz: '', ort: '', strasse: '', hausnummer: '', geburtsdatum: '', geschlecht: '', familienstand: '',
  kontaktweg: [], email: '', telefon: '',
};

const kvKind = (form) => KV_BY_VALUE[form.versicherungsart]?.kind;


const hasMissingTeeth = (form) => form.fehlendeZaehne !== '' && form.fehlendeZaehne !== '0';
const needsMail = (form) => form.kontaktweg.includes(WANTS_MAIL);
const needsPhone = (form) => form.kontaktweg.includes(WANTS_PHONE) || form.kontaktweg.includes(WANTS_WHATSAPP);

const phoneLabel = (form) => {
  const phone = form.kontaktweg.includes(WANTS_PHONE);
  const whatsapp = form.kontaktweg.includes(WANTS_WHATSAPP);
  if (phone && whatsapp) return 'Telefon- und WhatsApp-Nummer';
  return whatsapp ? 'WhatsApp-Nummer' : 'Telefonnummer';
};

// Validation per step. Returns { field: message } for visible required fields only,
// in the order of the form, so the first key is the field to jump to. Messages stay German
// here and are translated where they are shown, so they follow a language switch.
function validateStep(step, form) {
  const e = {};
  const required = (key, message) => { if (!form[key]) e[key] = message; };

  if (step === 1) {
    if (!form.datenschutz) e.datenschutz = 'Bitte willigen Sie ein, damit ich Ihre Anfrage bearbeiten darf.';
  }
  if (step === 2) {
    required('behandlung', 'Bitte geben Sie an, ob eine Behandlung läuft oder geplant ist.');
    required('heilkostenplan', 'Bitte geben Sie an, ob ein Heil- und Kostenplan vorliegt.');
    required('fehlendeZaehne', 'Bitte wählen Sie die Anzahl der fehlenden Zähne, auch wenn es 0 sind.');
    if (hasMissingTeeth(form)) required('zahnluecke', 'Bitte geben Sie an, ob die Zahnlücken mitversichert werden sollen.');
    required('parodontose', 'Bitte beantworten Sie die Frage zur Parodontitis.');
    if (form.schwerpunkt.length === 0) e.schwerpunkt = 'Bitte wählen Sie mindestens einen Bereich aus.';
    required('vorherigeVersicherung', 'Bitte geben Sie an, ob eine andere Zahnersatzversicherung bestand.');
  }
  if (step === 3) {
    required('erwerbsstatus', 'Bitte wählen Sie Ihre berufliche Situation aus.');
    if (form.erwerbsstatus === 'Verbeamtet') required('beihilfe', 'Bitte geben Sie an, ob Sie Anspruch auf Beihilfe haben.');
    required('versicherungsart', 'Bitte geben Sie an, wie Sie krankenversichert sind.');
    const kind = kvKind(form);
    if (kind === 'gkv' || kind === 'pkv') {
      const missing = kind === 'gkv' ? 'Bitte wählen Sie Ihre Krankenkasse aus.' : 'Bitte wählen Sie Ihren Krankenversicherer aus.';
      if (form.kasseIstAndere) {
        if (!form.kasseFreitext.trim()) e.kasseFreitext = 'Bitte tragen Sie den Namen ein.';
      } else if (!form.kasse) {
        e.kasse = missing;
      }
    }
    if (kind === 'gkv') required('wechsel', 'Bitte geben Sie an, ob ein Wechsel für Sie in Frage kommt.');
  }
  if (step === 4) {
    if (form.name.trim().length < 3) e.name = 'Bitte geben Sie Ihren Vor- und Nachnamen an.';
    if (!/^\d{5}$/.test(form.plz)) e.plz = 'Bitte geben Sie Ihre fünfstellige Postleitzahl an.';
    if (form.ort.trim().length < 2) e.ort = 'Bitte geben Sie Ihren Ort an.';
    if (form.strasse.trim().length < 3) e.strasse = 'Bitte geben Sie Ihre Straße an.';
    if (!form.hausnummer.trim()) e.hausnummer = 'Bitte geben Sie Ihre Hausnummer an. Falls es keine gibt, schreiben Sie „ohne“.';
    const birth = form.geburtsdatum ? new Date(form.geburtsdatum) : null;
    if (!birth || Number.isNaN(birth.getTime())) e.geburtsdatum = 'Bitte geben Sie Ihr Geburtsdatum an.';
    else if (birth > new Date() || birth.getFullYear() < 1900) e.geburtsdatum = 'Bitte prüfen Sie Ihr Geburtsdatum.';
    required('geschlecht', 'Bitte wählen Sie eine Angabe aus.');
    required('familienstand', 'Bitte wählen Sie Ihren Familienstand aus.');
    if (form.kontaktweg.length === 0) e.kontaktweg = 'Bitte wählen Sie mindestens einen Kontaktweg aus.';
    if (needsMail(form) && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email.trim())) e.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
    if (needsPhone(form) && form.telefon.replace(/\D/g, '').length < 6) e.telefon = `Bitte geben Sie Ihre ${phoneLabel(form)} an.`;
  }
  return e;
}

// What the CRM receives: only answers that are still visible, with the insurer as one
// readable text. Statutory funds carry the total contribution rate.
function buildPayload(form) {
  const kind = kvKind(form);
  const krankenkasse = krankenkasseText({ kind, kasse: form.kasse, istAndere: form.kasseIstAndere, freitext: form.kasseFreitext });
  return {
    datenschutz: form.datenschutz,
    behandlung: form.behandlung,
    heilkostenplan: form.heilkostenplan,
    fehlendeZaehne: form.fehlendeZaehne,
    zahnluecke: hasMissingTeeth(form) ? form.zahnluecke : '',
    parodontose: form.parodontose,
    schwerpunkt: form.schwerpunkt,
    vorherigeVersicherung: form.vorherigeVersicherung,
    erwerbsstatus: form.erwerbsstatus,
    beihilfe: form.erwerbsstatus === 'Verbeamtet' ? form.beihilfe : '',
    versicherungsart: form.versicherungsart,
    krankenkasse,
    wechsel: kind === 'gkv' ? form.wechsel : '',
    bonusprogramm: kind === 'gkv' ? form.bonusprogramm : '',
    name: form.name.trim(),
    anschrift: `${form.plz} ${form.ort.trim()}, ${form.strasse.trim()} ${form.hausnummer.trim()}`,
    geburtsdatum: form.geburtsdatum,
    geschlecht: form.geschlecht,
    familienstand: form.familienstand,
    kontaktweg: form.kontaktweg,
    email: needsMail(form) ? form.email.trim() : '',
    telefon: needsPhone(form) ? form.telefon.trim() : '',
  };
}

// ─── Shared styles ───
const ERROR = '#A33A2A';

const inputStyle = (invalid) => ({
  width: '100%', padding: '14px 18px',
  background: 'var(--input-bg)',
  border: `1px solid ${invalid ? ERROR : 'var(--border)'}`, borderRadius: 10,
  color: 'var(--text-body)', fontSize: 16,
  fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.3s',
  boxSizing: 'border-box',
});

const labelStyle = {
  fontSize: 14, color: 'var(--text-muted)',
  display: 'block', marginBottom: 6, lineHeight: 1.5,
};

const pillBtn = (active) => ({
  flex: 1, padding: '12px 8px', minHeight: 44,
  background: active ? 'var(--accent)' : 'var(--input-bg)',
  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 10,
  color: active ? 'var(--bg-primary)' : 'var(--text-body)',
  fontWeight: active ? 700 : 500,
  fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.3s',
  minWidth: 0,
});

const optionBox = (active) => ({
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 16px',
  background: active ? 'var(--accent-dim)' : 'var(--input-bg)',
  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
});

const marker = (active, round) => ({
  width: 20, height: 20, borderRadius: round ? '50%' : 4, flexShrink: 0,
  border: `2px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
  background: active ? 'var(--accent)' : 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.3s',
});

const optionText = (active) => ({
  fontSize: 14,
  color: active ? 'var(--accent)' : 'var(--text-body)',
  fontWeight: active ? 600 : 400,
  lineHeight: 1.5,
});

const navBtn = (isPrimary, enabled = true) => ({
  flex: isPrimary ? 2 : 1, padding: '16px', minHeight: 54,
  background: isPrimary ? 'var(--accent)' : 'transparent',
  border: isPrimary ? 'none' : '1px solid var(--border-strong)',
  borderRadius: 10,
  color: isPrimary ? 'var(--bg-primary)' : 'var(--text-body)',
  fontWeight: isPrimary ? 700 : 500, fontSize: 16,
  cursor: enabled ? 'pointer' : 'wait',
  opacity: enabled ? 1 : 0.7,
  fontFamily: 'inherit',
  transition: 'all 0.3s',
  boxShadow: isPrimary ? '0 4px 30px var(--shadow-accent)' : 'none',
});

// ─── Form parts ───
// Answers keep their German value for the CRM; only what is shown goes through t().
const hiddenInput = { position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 };

function FieldError({ id, message }) {
  const { t } = useLang();
  if (!message) return null;
  return <p id={`${id}-error`} role="alert" style={{ fontSize: 13, color: ERROR, lineHeight: 1.45, margin: '7px 0 0' }}>{t(message)}</p>;
}

// Fieldset-style wrapper for a question with several answers.
function Group({ id, label, error, children }) {
  const { t } = useLang();
  return (
    <div id={`q-${id}`} role="group" aria-labelledby={`q-${id}-label`} tabIndex={-1} style={{ scrollMarginTop: 24, outline: 'none' }}>
      <div id={`q-${id}-label`} style={labelStyle}>{t(label)}</div>
      {children}
      <FieldError id={`q-${id}`} message={error} />
    </div>
  );
}

function RadioGroup({ name, value, options, onChange }) {
  const { t } = useLang();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : (opt.label || opt.value);
        const active = value === val;
        return (
          <label key={val} className="q-opt" style={{ ...optionBox(active), position: 'relative' }}>
            <input type="radio" name={name} value={val} checked={active} onChange={() => onChange(val)} style={hiddenInput} />
            <span style={marker(active, true)}>
              {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-primary)' }} />}
            </span>
            <span style={optionText(active)}>{t(label)}</span>
          </label>
        );
      })}
    </div>
  );
}

function CheckboxGroup({ name, values, options, onToggle }) {
  const { t } = useLang();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((val) => {
        const active = values.includes(val);
        return (
          <label key={val} className="q-opt" style={{ ...optionBox(active), position: 'relative' }}>
            <input type="checkbox" name={name} value={val} checked={active} onChange={() => onToggle(val)} style={hiddenInput} />
            <span style={marker(active, false)}>
              {active && <span style={{ color: 'var(--bg-primary)', fontSize: 12, fontWeight: 700 }}>{'✓'}</span>}
            </span>
            <span style={optionText(active)}>{t(val)}</span>
          </label>
        );
      })}
    </div>
  );
}

function Pills({ value, options, onChange, wrap }) {
  const { t } = useLang();
  return (
    <div style={{ display: 'flex', gap: wrap ? 8 : 10, flexWrap: wrap ? 'wrap' : 'nowrap' }}>
      {options.map((o) => (
        <button
          key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}
          style={{ ...pillBtn(value === o), ...(wrap ? { minWidth: 48, flex: '0 0 auto' } : {}) }}
        >{t(o)}</button>
      ))}
    </div>
  );
}

const headingStyle = { fontSize: 18, fontWeight: 700, color: 'var(--accent)', margin: 0, outline: 'none', lineHeight: 1.3, scrollMarginTop: 24 };
const headerBox = {
  background: 'var(--accent-dim)', border: '1px solid var(--accent)',
  borderRadius: 12, padding: '16px 20px', marginBottom: 4,
};

function StepHeading({ headingRef, title, subtitle }) {
  const { t } = useLang();
  return (
    <div style={headerBox}>
      <h3 ref={headingRef} tabIndex={-1} style={headingStyle}>{t(title)}</h3>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>{t(subtitle)}</p>}
    </div>
  );
}

export default function Questionnaire() {
  const { t } = useLang();
  const [ref, inView] = useInView(0.05);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [orte, setOrte] = useState([]);
  const [plzUnknown, setPlzUnknown] = useState(false);
  const headingRef = useRef(null);
  const firstStep = useRef(true);
  // Inputs of step 4, so we can read values the browser autofilled without
  // triggering React's onChange handler.
  const personalRefs = useRef({});
  const bindRef = (key) => (el) => { if (el) personalRefs.current[key] = el; };

  // Applies a change and clears the error of the touched field.
  const patch = (changes) => {
    setForm((prev) => ({ ...prev, ...changes }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(changes).forEach((k) => delete next[k]);
      return next;
    });
  };
  const update = (key) => (val) => patch({ [key]: val });

  const toggleIn = (key) => (val) => {
    const list = form[key];
    patch({ [key]: list.includes(val) ? list.filter((v) => v !== val) : [...list, val] });
  };

  // ─── Dependent answers: hidden questions lose their previous answer ───
  const setFehlendeZaehne = (val) => {
    patch(val === '0' ? { fehlendeZaehne: val, zahnluecke: '' } : { fehlendeZaehne: val });
  };

  const resetInsurer = { kasse: '', kasseIstAndere: false, kasseFreitext: '', wechsel: '', bonusprogramm: '' };

  const setErwerbsstatus = (val) => {
    const changes = { erwerbsstatus: val };
    if (val !== 'Verbeamtet') changes.beihilfe = '';
    if (form.versicherungsart && !kvOptions(val).some((k) => k.value === form.versicherungsart)) {
      Object.assign(changes, { versicherungsart: '' }, resetInsurer);
    }
    patch(changes);
  };

  const setVersicherungsart = (val) => {
    const sameKind = KV_BY_VALUE[val]?.kind === kvKind(form);
    patch(sameKind ? { versicherungsart: val } : { versicherungsart: val, ...resetInsurer });
  };

  // Town and street belong to the postcode, so a different postcode clears them.
  const setPlz = (val) => {
    const plz = val.replace(/\D/g, '').slice(0, 5);
    patch(plz === form.plz ? { plz } : { plz, ort: '', strasse: '' });
  };

  const toggleKontaktweg = (val) => {
    const next = form.kontaktweg.includes(val) ? form.kontaktweg.filter((v) => v !== val) : [...form.kontaktweg, val];
    const changes = { kontaktweg: next };
    if (!next.includes(WANTS_MAIL)) changes.email = '';
    if (!next.includes(WANTS_PHONE) && !next.includes(WANTS_WHATSAPP)) changes.telefon = '';
    patch(changes);
  };

  // A complete postcode fills in the town. Several towns become a selection, an unknown
  // postcode only gets a hint: the town can always be typed by hand.
  useEffect(() => {
    if (!/^\d{5}$/.test(form.plz)) { setOrte([]); setPlzUnknown(false); return undefined; }
    let stale = false;
    (async () => {
      try {
        const res = await fetch(`/api/adresse?plz=${form.plz}`);
        const data = await res.json();
        if (stale) return;
        const found = data.orte || [];
        setOrte(found);
        setPlzUnknown(!!data.ok && found.length === 0);
        if (found.length === 1) patch({ ort: found[0] });
      } catch {
        // Offline or service down: the town is typed by hand.
      }
    })();
    return () => { stale = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.plz]);

  // After every step change jump to the new heading, for keyboard and screen reader too.
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    const heading = headingRef.current;
    if (!heading) return;
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  }, [step]);

  // Warn user if they try to close the tab while a submission is in flight.
  // The browser shows a generic confirmation; the lead is already being saved
  // server-side but the mail notification needs the request to complete.
  useEffect(() => {
    if (!sending) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sending]);

  const syncAutofill = () => {
    const merged = { ...form };
    const changes = {};
    Object.entries(personalRefs.current).forEach(([key, el]) => {
      if (el.isConnected && el.value !== form[key]) { changes[key] = el.value; merged[key] = el.value; }
    });
    if (Object.keys(changes).length) setForm((prev) => ({ ...prev, ...changes }));
    return merged;
  };

  // Validates the step; on errors shows them at the fields and jumps to the first one.
  const checkStep = (current) => {
    const found = validateStep(step, current);
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      setTimeout(() => {
        const el = document.getElementById(`q-${firstKey}`);
        if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, 50);
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (checkStep(form)) setStep((s) => s + 1);
  };

  const goBack = () => {
    syncAutofill();
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    // Enter in a text field of an earlier step must not send the form.
    if (step < TOTAL_STEPS) { goNext(); return; }
    const current = syncAutofill();
    if (!checkStep(current)) return;
    setSending(true);
    setSendFailed(false);
    try {
      // Single server-side call. The API route persists to Supabase and then
      // triggers the mail notification with retry/backoff. If the mail pipeline
      // fails after retries, the lead is still saved and Marco's admin shows it
      // as "Mail noch nicht versandt" with a manual resend.
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(current)),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
      setTimeout(() => document.getElementById('fragebogen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch {
      setSendFailed(true);
    } finally {
      setSending(false);
    }
  };

  // Keeps a text input's error wired to the field.
  const inputProps = (key, invalidKey = key) => ({
    id: `q-${key}`,
    style: { ...inputStyle(!!errors[invalidKey]), scrollMarginTop: 24 },
    value: form[key],
    'aria-invalid': errors[invalidKey] ? true : undefined,
    'aria-describedby': errors[invalidKey] ? `q-${key}-error` : undefined,
    onChange: (e) => update(key)(e.target.value),
  });

  if (submitted) {
    const vorname = form.name.trim().split(' ')[0];
    return (
      <section id="fragebogen" style={{
        padding: '100px 24px', background: 'var(--bg-secondary)', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--accent)',
          }}>{'✓'}</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, color: 'var(--text-primary)', marginBottom: 12,
          }}>{t('Anfrage gesendet!')}</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {t('Danke')}, {vorname}! {t('Ich melde mich innerhalb von 24 Stunden mit Ihrem persönlichen Angebot.')}
          </p>
        </div>
      </section>
    );
  }

  const kind = kvKind(form);
  const insurerError = errors.kasse;

  return (
    <section id="fragebogen" ref={ref} className="q-section" style={{
      background: 'var(--bg-secondary)', transition: 'background 0.5s ease',
    }}>
      <div style={{
        maxWidth: 680, margin: '0 auto',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>{t('Fragebogen')}</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, lineHeight: 1.2,
          }}>{t('Ihr persönliches Angebot')}</h2>
        </div>

        <div className="q-card" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
        }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('Schritt')} {step} {t('von')} {TOTAL_STEPS}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
                {t(STEP_LABELS[step - 1])}
              </span>
            </div>
            <div
              role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-valuenow={step}
              aria-label={t('Fortschritt des Fragebogens')}
              style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}
            >
              <div style={{
                height: '100%', background: 'var(--accent)',
                transform: `scaleX(${step / TOTAL_STEPS})`, transformOrigin: 'left',
                transition: 'transform 0.4s ease',
              }} />
            </div>
          </div>

          {/* Height glides between steps and follow-up questions; each step fades in. */}
          <SmoothHeight>
          <form key={step} className="q-step" noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ═══ STEP 1: Einführung und Einwilligung ═══ */}
            {step === 1 && (
              <>
                <StepHeading headingRef={headingRef} title="Ihr Weg zur passenden Zahnzusatzversicherung" />
                <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p>{t('Welche Absicherung passt zu Ihren Zähnen und Ihren Wünschen? Mit wenigen Angaben helfen Sie mir, passende Möglichkeiten für Sie zu prüfen. Ich schaue mir Ihre Anfrage persönlich an und melde mich über Ihren gewünschten Kontaktweg.')}</p>
                  <p>{t('Eine Behandlung wurde bereits empfohlen, ist geplant oder läuft schon? Bitte geben Sie das im Fragebogen an, auch bei einer mündlichen Empfehlung. Ich prüfe, welche Möglichkeiten bestehen. Eine Kostenübernahme für diese Behandlung lässt sich vorab nicht zusagen.')}</p>
                  <p style={{ color: 'var(--text-primary)' }}>{t('Ihre Anfrage ist kostenlos und unverbindlich. Sie schließen hier noch keine Versicherung ab.')}</p>
                </div>

                <div>
                  <label className="q-opt" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '8px 0', position: 'relative' }}>
                    <input
                      id="q-datenschutz" type="checkbox" checked={form.datenschutz}
                      aria-invalid={errors.datenschutz ? true : undefined}
                      aria-describedby={errors.datenschutz ? 'q-datenschutz-error' : undefined}
                      onChange={(e) => update('datenschutz')(e.target.checked)}
                      style={hiddenInput}
                    />
                    <span style={{ ...marker(form.datenschutz, false), marginTop: 2, ...(errors.datenschutz ? { borderColor: ERROR } : {}) }}>
                      {form.datenschutz && <span style={{ color: 'var(--bg-primary)', fontSize: 12, fontWeight: 700 }}>{'✓'}</span>}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      {t('Ich willige in die Verarbeitung meiner personenbezogenen Daten einschließlich meiner Gesundheitsdaten (Angaben zum Zahnzustand) zur Erstellung eines Versicherungsangebots ein. Details finden Sie in der')}{' '}
                      <a href="/datenschutz" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                        {t('Datenschutzerklärung')}
                      </a>. *
                    </span>
                  </label>
                  <FieldError id="q-datenschutz" message={errors.datenschutz} />
                </div>

                <button type="button" onClick={goNext} style={navBtn(true)}>{t('Weiter')}</button>
              </>
            )}

            {/* ═══ STEP 2: Zahnstatus ═══ */}
            {step === 2 && (
              <>
                <StepHeading headingRef={headingRef} title="Zahnstatus" />

                <Group id="behandlung" error={errors.behandlung} label="Erfolgt zur Zeit eine zahnärztliche oder kieferorthopädische Behandlung oder ist sie angeraten oder beabsichtigt? *">
                  <RadioGroup name="behandlung" value={form.behandlung} onChange={update('behandlung')} options={BEHANDLUNG} />
                </Group>

                <Group id="heilkostenplan" error={errors.heilkostenplan} label="Liegt ein aktueller Heil- und Kostenplan Ihres Zahnarztes vor? *">
                  <RadioGroup name="heilkostenplan" value={form.heilkostenplan} onChange={update('heilkostenplan')} options={JA_NEIN} />
                </Group>

                <Group id="fehlendeZaehne" error={errors.fehlendeZaehne} label="Fehlen Zähne, außer Weisheitszähne, die nicht ersetzt sind? *">
                  <Pills wrap value={form.fehlendeZaehne} onChange={setFehlendeZaehne} options={FEHLENDE_ZAEHNE} />
                </Group>

                {hasMissingTeeth(form) && (
                  <Group id="zahnluecke" error={errors.zahnluecke} label="Möchten Sie vorhandene Zahnlücken mitversichern lassen? *">
                    <Pills value={form.zahnluecke} onChange={update('zahnluecke')} options={JA_NEIN} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: '10px 0 0' }}>
                      {t('Je nach Tarif können fehlende Zähne zu einem Risikozuschlag oder Leistungsausschluss führen. Ob und unter welchen Bedingungen Ihre Zahnlücken mitversichert werden können, prüfe ich individuell.')}
                    </p>
                  </Group>
                )}

                <Group id="parodontose" error={errors.parodontose} label="Wird derzeit oder wurde innerhalb der letzten drei Jahre eine parodontale Erkrankung festgestellt und/oder behandelt? (Parodontitis) *">
                  <RadioGroup name="parodontose" value={form.parodontose} onChange={update('parodontose')} options={PARODONTOSE} />
                </Group>

                <Group id="schwerpunkt" error={errors.schwerpunkt} label="Welcher Bereich ist Ihnen am wichtigsten? * (Mehrfachauswahl)">
                  <CheckboxGroup name="schwerpunkt" values={form.schwerpunkt} onToggle={toggleIn('schwerpunkt')} options={SCHWERPUNKT} />
                </Group>

                <Group id="vorherigeVersicherung" error={errors.vorherigeVersicherung} label="Bestand innerhalb der letzten 6 Monate bereits eine anderweitige Zahnersatzversicherung? *">
                  <Pills value={form.vorherigeVersicherung} onChange={update('vorherigeVersicherung')} options={JA_NEIN} />
                </Group>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={goBack} style={navBtn(false)}>{t('Zurück')}</button>
                  <button type="button" onClick={goNext} style={navBtn(true)}>{t('Weiter')}</button>
                </div>
              </>
            )}

            {/* ═══ STEP 3: Erwerbsstatus und Krankenversicherung ═══ */}
            {step === 3 && (
              <>
                <StepHeading headingRef={headingRef} title="Erwerbsstatus und Krankenversicherung" />

                <Group id="erwerbsstatus" error={errors.erwerbsstatus} label="Wie sind Sie aktuell beruflich tätig? *">
                  <RadioGroup name="erwerbsstatus" value={form.erwerbsstatus} onChange={setErwerbsstatus} options={ERWERBSSTATUS.map((s) => s.value)} />
                </Group>

                {form.erwerbsstatus === 'Verbeamtet' && (
                  <Group id="beihilfe" error={errors.beihilfe} label="Haben Sie Anspruch auf Beihilfe? *">
                    <RadioGroup name="beihilfe" value={form.beihilfe} onChange={update('beihilfe')} options={BEIHILFE} />
                  </Group>
                )}

                {form.erwerbsstatus && (
                  <Group id="versicherungsart" error={errors.versicherungsart} label="Wie sind Sie aktuell krankenversichert? *">
                    <RadioGroup name="versicherungsart" value={form.versicherungsart} onChange={setVersicherungsart} options={kvOptions(form.erwerbsstatus).map((k) => k.value)} />
                  </Group>
                )}

                {(kind === 'gkv' || kind === 'pkv') && (
                  <div>
                    <label htmlFor="q-kasse" style={labelStyle}>
                      {t(kind === 'gkv' ? 'Bei welcher gesetzlichen Krankenkasse sind Sie versichert? *' : 'Bei welchem privaten Krankenversicherer sind Sie versichert? *')}
                    </label>
                    <InsurerSelect
                      id="q-kasse" items={kind === 'gkv' ? GKV : PKV}
                      value={form.kasse} isOther={form.kasseIstAndere}
                      placeholder={t(kind === 'gkv' ? 'Krankenkasse auswählen' : 'Krankenversicherer auswählen')}
                      searchLabel={t(kind === 'gkv' ? 'Krankenkasse suchen' : 'Krankenversicherer suchen')}
                      invalid={!!insurerError}
                      onSelect={(item) => patch({ kasse: item.name, kasseIstAndere: false, kasseFreitext: '' })}
                      onChooseOther={() => patch({ kasse: '', kasseIstAndere: true })}
                    />
                    <FieldError id="q-kasse" message={insurerError} />
                    {kind === 'gkv' && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '8px 0 0' }}>
                        {t('Prozentangabe: Gesamtbeitragssatz der Krankenkasse, Stand')} {RATES_AS_OF}{t(', ohne Gewähr.')}
                      </p>
                    )}
                    {form.kasseIstAndere && (
                      <div style={{ marginTop: 12 }}>
                        <label htmlFor="q-kasseFreitext" style={labelStyle}>{t(kind === 'gkv' ? 'Name Ihrer Krankenkasse *' : 'Name Ihres Krankenversicherers *')}</label>
                        <input {...inputProps('kasseFreitext')} type="text" autoFocus />
                        <FieldError id="q-kasseFreitext" message={errors.kasseFreitext} />
                      </div>
                    )}
                  </div>
                )}

                {kind === 'gkv' && (
                  <>
                    <Group id="wechsel" error={errors.wechsel} label="Kommt ein Wechsel der Krankenkasse in Frage, wenn sich Preis und/oder Leistung dadurch verbessern? *">
                      <RadioGroup name="wechsel" value={form.wechsel} onChange={update('wechsel')} options={WECHSEL} />
                    </Group>
                    <Group id="bonusprogramm" label="Nehmen Sie aktuell an einem Bonusprogramm Ihrer Krankenkasse teil?">
                      <RadioGroup name="bonusprogramm" value={form.bonusprogramm} onChange={update('bonusprogramm')} options={JA_NEIN} />
                    </Group>
                  </>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={goBack} style={navBtn(false)}>{t('Zurück')}</button>
                  <button type="button" onClick={goNext} style={navBtn(true)}>{t('Weiter')}</button>
                </div>
              </>
            )}

            {/* ═══ STEP 4: Persönliche Angaben und Kontakt ═══ */}
            {step === 4 && (
              <>
                <StepHeading
                  headingRef={headingRef}
                  title="Persönliche Angaben und Kontakt"
                  subtitle="Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet."
                />

                <div>
                  <label htmlFor="q-name" style={labelStyle}>{t('Vor- und Nachname *')}</label>
                  <input {...inputProps('name')} ref={bindRef('name')} autoComplete="name" placeholder={t('Max Mustermann')} />
                  <FieldError id="q-name" message={errors.name} />
                </div>

                <div className="q-row-plz">
                  <div>
                    <label htmlFor="q-plz" style={labelStyle}>{t('Postleitzahl *')}</label>
                    <input
                      {...inputProps('plz')} ref={bindRef('plz')} onChange={(e) => setPlz(e.target.value)}
                      inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="60311"
                    />
                  </div>
                  <div>
                    <label htmlFor="q-ort" style={labelStyle}>{t('Ort *')}</label>
                    {orte.length > 1 ? (
                      <select {...inputProps('ort')} style={{ ...inputProps('ort').style, height: 52 }}>
                        <option value="">{t('Bitte wählen')}</option>
                        {orte.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input {...inputProps('ort')} ref={bindRef('ort')} autoComplete="address-level2" placeholder={t('Wird ergänzt')} />
                    )}
                  </div>
                </div>
                {(errors.plz || errors.ort || plzUnknown) && (
                  <div style={{ marginTop: -14 }}>
                    <FieldError id="q-plz" message={errors.plz} />
                    <FieldError id="q-ort" message={errors.ort} />
                    {plzUnknown && !errors.plz && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45, margin: '7px 0 0' }}>{t('Diese Postleitzahl ist uns nicht bekannt. Bitte prüfen Sie sie oder tragen Sie den Ort selbst ein.')}</p>
                    )}
                  </div>
                )}

                <div className="q-row-street">
                  <div>
                    <label htmlFor="q-strasse" style={labelStyle}>{t('Straße *')}</label>
                    <StreetInput
                      id="q-strasse" plz={form.plz} ref={bindRef('strasse')} autoComplete="off"
                      placeholder={t('Musterstraße')}
                      style={{ ...inputStyle(!!errors.strasse), scrollMarginTop: 24 }}
                      value={form.strasse} onChange={update('strasse')}
                      onPick={(label, number) => {
                        patch(number ? { strasse: label, hausnummer: number } : { strasse: label });
                        personalRefs.current.hausnummer?.focus();
                      }}
                      aria-invalid={errors.strasse ? true : undefined}
                      aria-describedby={errors.strasse ? 'q-strasse-error' : undefined}
                    />
                    <FieldError id="q-strasse" message={errors.strasse} />
                  </div>
                  <div>
                    <label htmlFor="q-hausnummer" style={labelStyle}>{t('Hausnummer *')}</label>
                    <input {...inputProps('hausnummer')} ref={bindRef('hausnummer')} autoComplete="off" placeholder="6a" />
                    <FieldError id="q-hausnummer" message={errors.hausnummer} />
                  </div>
                </div>

                <div>
                  <label htmlFor="q-geburtsdatum" style={labelStyle}>{t('Geburtsdatum *')}</label>
                  <input {...inputProps('geburtsdatum')} ref={bindRef('geburtsdatum')} type="date" autoComplete="bday" />
                  <FieldError id="q-geburtsdatum" message={errors.geburtsdatum} />
                </div>

                <Group id="geschlecht" error={errors.geschlecht} label="Geschlecht *">
                  <RadioGroup name="geschlecht" value={form.geschlecht} onChange={update('geschlecht')} options={GESCHLECHT} />
                </Group>

                <Group id="familienstand" error={errors.familienstand} label="Familienstand *">
                  <RadioGroup name="familienstand" value={form.familienstand} onChange={update('familienstand')} options={FAMILIENSTAND} />
                </Group>

                <Group id="kontaktweg" error={errors.kontaktweg} label="Wie darf ich Sie kontaktieren? * (Mehrfachauswahl)">
                  <CheckboxGroup name="kontaktweg" values={form.kontaktweg} onToggle={toggleKontaktweg} options={KONTAKTWEG} />
                </Group>

                {needsMail(form) && (
                  <div>
                    <label htmlFor="q-email" style={labelStyle}>{t('E-Mail-Adresse *')}</label>
                    <input {...inputProps('email')} ref={bindRef('email')} type="email" autoComplete="email" placeholder={t('ihre@email.de')} />
                    <FieldError id="q-email" message={errors.email} />
                  </div>
                )}

                {needsPhone(form) && (
                  <div>
                    <label htmlFor="q-telefon" style={labelStyle}>{t(`${phoneLabel(form)} *`)}</label>
                    <input {...inputProps('telefon')} ref={bindRef('telefon')} type="tel" autoComplete="tel" placeholder="+49 ..." />
                    <FieldError id="q-telefon" message={errors.telefon} />
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={goBack} disabled={sending} style={{ ...navBtn(false, !sending), flex: '1 1 110px' }}>{t('Zurück')}</button>
                  <button type="submit" disabled={sending} style={{ ...navBtn(true, !sending), flex: '2 1 240px' }}>
                    {sending ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <span
                          aria-hidden
                          style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            animation: 'q-spin 0.8s linear infinite',
                            display: 'inline-block',
                          }}
                        />
                        {t('Wird gesendet…')}
                      </span>
                    ) : t('Unverbindliche Zahnzusatz-Anfrage senden')}
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                  {t('Damit entsteht noch kein Versicherungsvertrag.')}
                </p>
                {sending && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                    {t('Bitte schließen Sie den Tab nicht, der Versand kann bis zu 20 Sekunden dauern.')}
                  </p>
                )}
                {sendFailed && (
                  <p role="alert" style={{ fontSize: 14, color: ERROR, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                    {t('Ihre Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es noch einmal oder schreiben Sie an')}{' '}
                    <a href="mailto:kontakt@marcoarpa.com" style={{ color: ERROR, textDecoration: 'underline' }}>kontakt@marcoarpa.com</a>.
                  </p>
                )}
                <style jsx>{`
                  @keyframes q-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                  }
                `}</style>
              </>
            )}
          </form>
          </SmoothHeight>
        </div>
      </div>
    </section>
  );
}
