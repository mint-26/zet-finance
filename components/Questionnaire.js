'use client';

import { useState } from 'react';
import { useInView } from './useInView';

export default function Questionnaire() {
  const [ref, inView] = useInView(0.05);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [form, setForm] = useState({
    // Step 1 - Persönliche Angaben
    name: '', anschrift: '', geburtsdatum: '', familienstand: '',
    telefon: '', email: '', beruf: '',
    // Step 2 - Krankenversicherung
    versicherungsart: '', krankenkasse: '', wechsel: '', bonusprogramm: '',
    // Step 3 - Zahnstatus
    behandlung: '', heilkostenplan: '', fehlendeZaehne: '',
    zahnluecke: '', parodontose: '', schwerpunkt: [],
    vorherigeVersicherung: '',
    // Step 4 - Beratung & Kontakt
    kontaktweg: [], zusatzversicherung: [], beratungstermin: [],
    // Datenschutz
    datenschutz: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleArray = (key, val) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((v) => v !== val)
        : [...prev[key], val],
    }));
  };

  const step1Valid = form.name && form.anschrift && form.geburtsdatum && form.familienstand && form.telefon && form.email;
  const step2Valid = form.versicherungsart && form.krankenkasse && form.wechsel;
  const step3Valid = form.behandlung && form.heilkostenplan && form.fehlendeZaehne && form.zahnluecke && form.parodontose && form.schwerpunkt.length > 0 && form.vorherigeVersicherung;
  const step4Valid = form.kontaktweg.length > 0 && form.zusatzversicherung.length > 0 && form.beratungstermin.length > 0 && form.datenschutz;

  const canNext = () => {
    if (step === 1) return true; // Intro, always valid
    if (step === 2) return step1Valid;
    if (step === 3) return step2Valid;
    if (step === 4) return step3Valid;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!step4Valid || sending) return;
    setSending(true);
    try {
      await fetch('https://formsubmit.co/ajax/marco.arpa@outlook.de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Neues Zahnzusatz-Angebot: ' + form.name,
          'Vor- und Nachname': form.name,
          'Anschrift': form.anschrift,
          'Geburtsdatum': form.geburtsdatum,
          'Familienstand': form.familienstand,
          'Telefon': form.telefon,
          'E-Mail': form.email,
          'Beruf': form.beruf || '\u2014',
          'Krankenversicherungsart': form.versicherungsart,
          'Krankenkasse': form.krankenkasse,
          'Kassenwechsel': form.wechsel,
          'Bonusprogramm': form.bonusprogramm || '\u2014',
          'Aktuelle Behandlung': form.behandlung,
          'Heil- und Kostenplan': form.heilkostenplan,
          'Fehlende Zähne': form.fehlendeZaehne,
          'Zahnlücke mitversichern': form.zahnluecke,
          'Parodontose': form.parodontose,
          'Schwerpunktbereich': form.schwerpunkt.join(', '),
          'Vorherige Zahnversicherung': form.vorherigeVersicherung,
          'Kontaktweg': form.kontaktweg.join(', '),
          'Zusatzversicherungen': form.zusatzversicherung.join(', '),
          'Beratungstermin': form.beratungstermin.join(', '),
        }),
      });
      setSubmitted(true);
      setTimeout(() => document.getElementById('fragebogen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch {
      setSubmitted(true);
      setTimeout(() => document.getElementById('fragebogen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } finally {
      setSending(false);
    }
  };

  // ─── Shared styles ───
  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: 'var(--input-bg)',
    border: '1px solid var(--border)', borderRadius: 10,
    color: 'var(--text-body)', fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 14, color: 'var(--text-muted)',
    display: 'block', marginBottom: 6, lineHeight: 1.5,
  };

  const pillBtn = (active) => ({
    flex: 1, padding: '12px 8px',
    background: active
      ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
      : 'var(--input-bg)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 10,
    color: active ? 'var(--bg-primary)' : 'var(--text-body)',
    fontWeight: active ? 700 : 500,
    fontSize: 13, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.3s',
    minWidth: 0,
  });

  const radioOption = (active) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px',
    background: active ? 'var(--accent-dim)' : 'var(--input-bg)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s',
  });

  const radioDot = (active) => ({
    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active
      ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
      : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s',
  });

  const checkBox = (active) => ({
    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active
      ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
      : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s',
  });

  const optionText = (active) => ({
    fontSize: 14,
    color: active ? 'var(--accent)' : 'var(--text-body)',
    fontWeight: active ? 600 : 400,
    lineHeight: 1.5,
  });

  const navBtn = (active, isPrimary) => ({
    flex: isPrimary ? 2 : 1, padding: '16px',
    background: active
      ? (isPrimary ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'transparent')
      : 'var(--text-dim)',
    border: isPrimary ? 'none' : '1px solid var(--border)',
    borderRadius: 10,
    color: active
      ? (isPrimary ? 'var(--bg-primary)' : 'var(--text-body)')
      : 'var(--text-muted)',
    fontWeight: isPrimary ? 700 : 500, fontSize: 16,
    cursor: active ? 'pointer' : 'not-allowed',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.3s',
    boxShadow: active && isPrimary ? '0 4px 30px var(--shadow-accent)' : 'none',
  });

  // ─── Radio group helper ───
  const RadioGroup = ({ field, options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = form[field] === val;
        return (
          <label key={val} onClick={() => update(field, val)} style={radioOption(active)}>
            <div style={radioDot(active)}>
              {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-primary)' }} />}
            </div>
            <span style={optionText(active)}>{label}</span>
          </label>
        );
      })}
    </div>
  );

  // ─── Checkbox group helper ───
  const CheckboxGroup = ({ field, options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = form[field].includes(val);
        return (
          <label key={val} onClick={() => toggleArray(field, val)} style={radioOption(active)}>
            <div style={checkBox(active)}>
              {active && <span style={{ color: 'var(--bg-primary)', fontSize: 12, fontWeight: 700 }}>{'\u2713'}</span>}
            </div>
            <span style={optionText(active)}>{label}</span>
          </label>
        );
      })}
    </div>
  );

  // ─── Section header helper ───
  const SectionHeader = ({ title, subtitle }) => (
    <div style={{
      background: 'var(--accent-dim)', border: '1px solid var(--accent)',
      borderRadius: 12, padding: '16px 20px', marginBottom: 4,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );

  if (submitted) {
    const vorname = form.name.split(' ')[0];
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
          }}>{'\u2713'}</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, color: 'var(--text-primary)', marginBottom: 12,
          }}>Anfrage gesendet!</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Danke, {vorname}! Ich melde mich innerhalb von 24 Stunden mit Ihrem persönlichen Angebot.
          </p>
        </div>
      </section>
    );
  }

  const stepLabels = ['Einführung', 'Persönliche Angaben', 'Krankenversicherung', 'Zahnstatus', 'Beratung & Kontakt'];

  return (
    <section id="fragebogen" ref={ref} style={{
      padding: '100px 24px', background: 'var(--bg-secondary)', transition: 'background 0.5s ease',
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
          }}>Fragebogen</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, lineHeight: 1.2,
          }}>Ihr persönliches Angebot</h2>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 36,
        }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                Schritt {step} von {totalSteps}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                {stepLabels[step - 1]}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                width: `${(step / totalSteps) * 100}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ═══ STEP 1: Einführung ═══ */}
            {step === 1 && (
              <>
                <SectionHeader title="Einführung" />
                <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p><strong style={{ color: 'var(--text-primary)' }}>1. Personalisierte Beratung:</strong> Ich biete eine individuelle und auf Ihre Bedürfnisse zugeschnittene Beratung, die Ihnen hilft, die bestmöglichen Entscheidungen für Ihre finanzielle Zukunft zu treffen.</p>
                  <p><strong style={{ color: 'var(--text-primary)' }}>2. Effiziente Lösungen:</strong> Unsere Produkte und Dienstleistungen sind darauf ausgerichtet, Ihre finanziellen Ziele effektiv und kosteneffizient zu erreichen, wodurch Sie Zeit und Geld sparen.</p>
                  <p><strong style={{ color: 'var(--text-primary)' }}>3. Langfristige Partnerschaft:</strong> Ich strebe nach langfristigen Beziehungen zu meinen Kunden, indem ich kontinuierliche Unterstützung und Beratung biete, um sicherzustellen, dass Ihre finanziellen Bedürfnisse auch in Zukunft erfüllt werden.</p>
                </div>
                <button type="button" onClick={() => setStep(2)}
                  style={navBtn(true, true)}>
                  Weiter
                </button>
              </>
            )}

            {/* ═══ STEP 2: Persönliche Angaben ═══ */}
            {step === 2 && (
              <>
                <SectionHeader
                  title="Persönliche Angaben"
                  subtitle="Bitte füllen Sie die folgenden Angaben sorgfältig aus. Ihre Daten werden ausschließlich zur Erstellung eines individuellen Angebots verwendet."
                />

                <div>
                  <label style={labelStyle}>Vor- und Nachname *</label>
                  <input style={inputStyle} value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Max Mustermann" />
                </div>

                <div>
                  <label style={labelStyle}>Vollständige Anschrift *<br />
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Postleitzahl → Ort → Straße → Hausnummer</span>
                  </label>
                  <input style={inputStyle} value={form.anschrift}
                    onChange={(e) => update('anschrift', e.target.value)}
                    placeholder="60311 Frankfurt am Main, Musterstraße 1" />
                </div>

                <div>
                  <label style={labelStyle}>Geburtsdatum *</label>
                  <input style={inputStyle} type="date" value={form.geburtsdatum}
                    onChange={(e) => update('geburtsdatum', e.target.value)} />
                </div>

                <div>
                  <label style={labelStyle}>Familienstand *</label>
                  <RadioGroup field="familienstand" options={[
                    'Ledig', 'Verheiratet', 'Verpartnert (in einem Haushalt lebend)', 'Geschieden', 'Verwitwet',
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Rückrufnummer *</label>
                  <input style={inputStyle} type="tel" value={form.telefon}
                    onChange={(e) => update('telefon', e.target.value)}
                    placeholder="+49 ..." />
                </div>

                <div>
                  <label style={labelStyle}>E-Mail-Adresse *</label>
                  <input style={inputStyle} type="email" value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="ihre@email.de" />
                </div>

                <div>
                  <label style={labelStyle}>Beruf (optional)</label>
                  <input style={inputStyle} value={form.beruf}
                    onChange={(e) => update('beruf', e.target.value)}
                    placeholder="z.B. Angestellter" />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(1)} style={navBtn(true, false)}>Zurück</button>
                  <button type="button" disabled={!step1Valid}
                    onClick={() => step1Valid && setStep(3)} style={navBtn(step1Valid, true)}>Weiter</button>
                </div>
              </>
            )}

            {/* ═══ STEP 3: Krankenversicherung ═══ */}
            {step === 3 && (
              <>
                <SectionHeader title="Krankenversicherung" />

                <div>
                  <label style={labelStyle}>Wie sind Sie krankenversichert? *</label>
                  <RadioGroup field="versicherungsart" options={[
                    'gesetzlich pflichtversichert',
                    'gesetzlich freiwilligversichert',
                    'gesetzlich familienversichert',
                    'privatversichert',
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Ihre Krankenkasse *</label>
                  <input style={inputStyle} value={form.krankenkasse}
                    onChange={(e) => update('krankenkasse', e.target.value)}
                    placeholder="z.B. AOK, TK, Barmer..." />
                </div>

                <div>
                  <label style={labelStyle}>Kommt ein Wechsel der Krankenkasse in Frage, wenn sich Preis und/oder Leistung dadurch verbessern? *</label>
                  <RadioGroup field="wechsel" options={[
                    { value: 'Ja, ich hätte gerne ein Vergleichsangebot', label: 'Ja, ich hätte gerne ein Vergleichsangebot' },
                    { value: 'Nein', label: 'Nein' },
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Nehmen Sie aktuell an einem Bonusprogramm Ihrer Krankenkasse teil?</label>
                  <RadioGroup field="bonusprogramm" options={['Ja', 'Nein']} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(2)} style={navBtn(true, false)}>Zurück</button>
                  <button type="button" disabled={!step2Valid}
                    onClick={() => step2Valid && setStep(4)} style={navBtn(step2Valid, true)}>Weiter</button>
                </div>
              </>
            )}

            {/* ═══ STEP 4: Zahnstatus ═══ */}
            {step === 4 && (
              <>
                <SectionHeader title="Zahnstatus" />

                <div>
                  <label style={labelStyle}>Erfolgt zur Zeit eine zahnärztliche oder kieferorthopädische Behandlung oder ist sie angeraten oder beabsichtigt? *</label>
                  <RadioGroup field="behandlung" options={[
                    { value: 'Ja, bereits dokumentiert', label: 'Ja, wurde bereits in der Krankenakte oder Heil- und Kostenplan dokumentiert' },
                    { value: 'Ja, nur kommuniziert', label: 'Ja, wurde bislang nur kommuniziert und noch nicht dokumentiert' },
                    { value: 'Nein', label: 'Nein' },
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Liegt ein aktueller Heil- und Kostenplan Ihres Zahnarztes vor? *</label>
                  <RadioGroup field="heilkostenplan" options={['Ja', 'Nein']} />
                </div>

                <div>
                  <label style={labelStyle}>Fehlen Zähne — außer Weisheitszähne — die nicht ersetzt sind? *</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['0', '1', '2', '3', '4', '4+'].map((n) => (
                      <button key={n} type="button" onClick={() => update('fehlendeZaehne', n)}
                        style={{ ...pillBtn(form.fehlendeZaehne === n), minWidth: 48, flex: '0 0 auto' }}>{n}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Möchten Sie die Zahnlücke mitversichern? *</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Ja', 'Nein'].map((o) => (
                      <button key={o} type="button" onClick={() => update('zahnluecke', o)}
                        style={pillBtn(form.zahnluecke === o)}>{o}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Wird derzeit oder wurde innerhalb der letzten drei Jahre eine parodontale Erkrankung festgestellt und/oder behandelt? (Parodontitis) *</label>
                  <RadioGroup field="parodontose" options={[
                    { value: 'Ja, aktuell in Behandlung', label: 'Ja, ist aktuell noch in Behandlung oder wurde vor Vertragsbeginn festgestellt' },
                    { value: 'Ja, ausgeheilt', label: 'Ja, ist bereits vollständig ausgeheilt und behandelt worden' },
                    { value: 'Nein', label: 'Nein' },
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Welcher Bereich ist Ihnen am wichtigsten? * (Mehrfachauswahl)</label>
                  <CheckboxGroup field="schwerpunkt" options={[
                    'Zahnersatz',
                    'Zahnbehandlung',
                    'Kieferorthopädie',
                    'Kosmetische Eingriffe (Zahnreinigung, Bleaching etc.)',
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Bestand innerhalb der letzten 6 Monate bereits eine anderweitige Zahnersatzversicherung? *</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['Ja', 'Nein'].map((o) => (
                      <button key={o} type="button" onClick={() => update('vorherigeVersicherung', o)}
                        style={pillBtn(form.vorherigeVersicherung === o)}>{o}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(3)} style={navBtn(true, false)}>Zurück</button>
                  <button type="button" disabled={!step3Valid}
                    onClick={() => step3Valid && setStep(5)} style={navBtn(step3Valid, true)}>Weiter</button>
                </div>
              </>
            )}

            {/* ═══ STEP 5: Beratung & Kontakt ═══ */}
            {step === 5 && (
              <>
                <SectionHeader title="Beratung & Kontakt" />

                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Möchten Sie zusätzlich eine persönliche Beratung zu weiteren Produktfeldern?
                </p>

                <div>
                  <label style={labelStyle}>Wie darf ich Sie kontaktieren? * (Mehrfachauswahl)</label>
                  <CheckboxGroup field="kontaktweg" options={[
                    'per E-Mail', 'Telefonisch', 'WhatsApp',
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Besteht das Interesse für weitere Zusatzabsicherungen? * (Mehrfachauswahl)</label>
                  <CheckboxGroup field="zusatzversicherung" options={[
                    'ambulante Zusatzabsicherung (Heilpraktiker, Sehhilfen, Präventive Gesundheitsmaßnahmen)',
                    'stationäre Zusatzabsicherung (Chefarztbehandlung, 1-2 Bett Zimmer, Behandlung als Privatpatient)',
                    'Sehhilfen (Kostenübernahme für Brillen und Kontaktlinsen, Lasix Operation)',
                    'private Unfallabsicherung (steuerfreie Auszahlung bei einem privaten Unfall, Kinder mitversichern)',
                    'keinen Bedarf (Bestandsprodukt vorhanden oder kein Interesse)',
                  ]} />
                </div>

                <div>
                  <label style={labelStyle}>Wünschen Sie einen Termin zur digitalen Vollberatung? * (Mehrfachauswahl)</label>
                  <CheckboxGroup field="beratungstermin" options={[
                    'Analyse der allgemeinen finanziellen Situation (Masterplan für die Zukunft)',
                    'Analyse und Optimierung Ihrer Vorsorge (Alters-, Kinder-, und sonstige Vorsorge)',
                    'Arbeitskraftabsicherung (schwere Krankheit, Unfall, Lohnfortzahlung)',
                    'Der Weg zum Betongold (eigene Immobilie und Kapitalanlage)',
                    'Finanzierungen (über 500 Banken im Vergleich)',
                    'Vermögensaufbau und Geldanlage',
                    'keine weitere Beratung gewünscht',
                  ]} />
                </div>

                {/* Datenschutz */}
                <label onClick={() => update('datenschutz', !form.datenschutz)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  cursor: 'pointer', padding: '8px 0',
                }}>
                  <div style={{ ...checkBox(form.datenschutz), marginTop: 2 }}>
                    {form.datenschutz && (
                      <span style={{ color: 'var(--bg-primary)', fontSize: 12, fontWeight: 700 }}>{'\u2713'}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                    <a href="/datenschutz" onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                      Datenschutzerklärung
                    </a>{' '}zu. *
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setStep(4)} style={navBtn(true, false)}>Zurück</button>
                  <button type="submit" disabled={!step4Valid || sending}
                    style={navBtn(step4Valid && !sending, true)}>
                    {sending ? 'Wird gesendet...' : 'Angebot anfordern'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
