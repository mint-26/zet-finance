'use client';

import { useState, useRef, useCallback } from 'react';
import { useInView } from './useInView';

const TOTAL_STEPS = 5;

function ProgressBar({ step }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i < step
            ? 'var(--accent)'
            : i === step
              ? 'linear-gradient(90deg, var(--accent), var(--accent-light))'
              : 'var(--border)',
          transition: 'background 0.4s ease',
        }} />
      ))}
    </div>
  );
}

function StepHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 28, textAlign: 'center' }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--accent-dim)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, margin: '0 auto 16px',
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
        marginBottom: 8,
      }}>{title}</h3>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function RadioGroup({ label, options, value, onChange, required }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        fontSize: 13, color: 'var(--text-muted)',
        display: 'block', marginBottom: 10,
      }}>{label}{required && ' *'}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                background: selected ? 'var(--accent-dim)' : 'var(--input-bg)',
                border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 10, cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: selected ? '2px solid var(--accent)' : '2px solid var(--text-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.25s',
              }}>
                {selected && <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)',
                }} />}
              </div>
              <span style={{
                fontSize: 14, color: selected ? 'var(--text-primary)' : 'var(--text-body)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: selected ? 500 : 400,
              }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, value, onChange, required }) {
  const toggleOption = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        fontSize: 13, color: 'var(--text-muted)',
        display: 'block', marginBottom: 10,
      }}>{label}{required && ' *'}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt) => {
          const selected = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                background: selected ? 'var(--accent-dim)' : 'var(--input-bg)',
                border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 10, cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                border: selected ? '2px solid var(--accent)' : '2px solid var(--text-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.25s',
                background: selected ? 'var(--accent)' : 'transparent',
              }}>
                {selected && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{
                fontSize: 14, color: selected ? 'var(--text-primary)' : 'var(--text-body)',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: selected ? 500 : 400,
              }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 13, color: 'var(--text-muted)',
        display: 'block', marginBottom: 6,
      }}>{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '14px 18px',
          background: 'var(--input-bg)',
          border: '1px solid var(--border)', borderRadius: 10,
          color: 'var(--text-body)', fontSize: 15,
          fontFamily: "'DM Sans', sans-serif",
          outline: 'none', transition: 'border-color 0.3s',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// Step content components
function Step1() {
  return (
    <div>
      <StepHeader
        icon="👋"
        title="Willkommen"
        subtitle="In wenigen Schritten erhalte ich alle wichtigen Infos, um dir das beste Angebot zusammenzustellen."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { icon: '🎯', title: 'Persönliche Beratung', text: 'Individuell auf deine Lebenssituation abgestimmt.' },
          { icon: '⚡', title: 'Effiziente Lösungen', text: 'Schnelle und transparente Vergleichsangebote.' },
          { icon: '🤝', title: 'Langfristige Partnerschaft', text: 'Ich begleite dich dauerhaft bei deinen Finanzentscheidungen.' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '16px 18px',
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{item.icon}</div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                marginBottom: 2,
              }}>{item.title}</div>
              <div style={{
                fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
              }}>{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2({ data, setData }) {
  const update = (key, val) => setData({ ...data, [key]: val });
  return (
    <div>
      <StepHeader
        icon="👤"
        title="Persönliche Angaben"
        subtitle="Bitte fülle die folgenden Angaben sorgfältig aus, damit ich dir das passende Angebot erstellen kann."
      />
      <TextInput label="Vollständiger Name" value={data.name} onChange={(v) => update('name', v)} placeholder="Max Mustermann" required />
      <TextInput label="Adresse (PLZ, Ort, Straße, Nr.)" value={data.address} onChange={(v) => update('address', v)} placeholder="12345 Berlin, Musterstraße 1" required />
      <TextInput label="Geburtsdatum" value={data.birthdate} onChange={(v) => update('birthdate', v)} placeholder="TT.MM.JJJJ" type="text" required />
      <RadioGroup
        label="Familienstand"
        options={['Ledig', 'Verheiratet', 'Eingetragene Lebenspartnerschaft', 'Geschieden', 'Verwitwet']}
        value={data.maritalStatus}
        onChange={(v) => update('maritalStatus', v)}
        required
      />
      <TextInput label="Rückrufnummer" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+49 123 456 7890" type="tel" required />
      <TextInput label="E-Mail-Adresse" value={data.email} onChange={(v) => update('email', v)} placeholder="deine@email.de" type="email" required />
      <TextInput label="Beruf" value={data.occupation} onChange={(v) => update('occupation', v)} placeholder="z.B. Ingenieur" />
    </div>
  );
}

function Step3({ data, setData }) {
  const update = (key, val) => setData({ ...data, [key]: val });
  return (
    <div>
      <StepHeader
        icon="🏥"
        title="Krankenversicherung"
        subtitle="Angaben zu deiner aktuellen Krankenversicherungssituation."
      />
      <RadioGroup
        label="Art der Versicherung"
        options={['Gesetzlich pflichtversichert', 'Gesetzlich freiwillig versichert', 'Gesetzlich familienversichert', 'Privat versichert']}
        value={data.insuranceType}
        onChange={(v) => update('insuranceType', v)}
        required
      />
      <TextInput label="Name des Versicherers" value={data.insuranceName} onChange={(v) => update('insuranceName', v)} placeholder="z.B. AOK, TK, Allianz..." required />
      <RadioGroup
        label="Interesse an einem Wechsel?"
        options={['Ja, ich hätte gerne ein Vergleichsangebot', 'Nein']}
        value={data.switchInterest}
        onChange={(v) => update('switchInterest', v)}
        required
      />
      <RadioGroup
        label="Nimmst du an einem Bonusprogramm teil?"
        options={['Ja', 'Nein']}
        value={data.bonusProgram}
        onChange={(v) => update('bonusProgram', v)}
      />
    </div>
  );
}

function Step4({ data, setData }) {
  const update = (key, val) => setData({ ...data, [key]: val });
  return (
    <div>
      <StepHeader
        icon="🦷"
        title="Zahnstatus"
        subtitle="Informationen zu deinem aktuellen Zahnstatus für die passende Zahnzusatzversicherung."
      />
      <RadioGroup
        label="Aktuelle oder geplante Zahnbehandlung?"
        options={['Ja', 'Nein']}
        value={data.dentalTreatment}
        onChange={(v) => update('dentalTreatment', v)}
        required
      />
      <RadioGroup
        label="Liegt ein Heil- und Kostenplan vor?"
        options={['Ja, dokumentiert', 'Ja, nur mündlich mitgeteilt', 'Nein']}
        value={data.treatmentPlan}
        onChange={(v) => update('treatmentPlan', v)}
        required
      />
      <RadioGroup
        label="Anzahl fehlender Zähne (ohne Weisheitszähne)"
        options={['0', '1', '2', '3', '4', 'Mehr als 4']}
        value={data.missingTeeth}
        onChange={(v) => update('missingTeeth', v)}
        required
      />
      <RadioGroup
        label="Zahnlückenversicherung einschließen?"
        options={['Ja', 'Nein']}
        value={data.gapInsurance}
        onChange={(v) => update('gapInsurance', v)}
        required
      />
      <RadioGroup
        label="Parodontose-Erkrankung?"
        options={['Aktuell in Behandlung', 'Früher, mittlerweile ausgeheilt', 'Nein']}
        value={data.periodontal}
        onChange={(v) => update('periodontal', v)}
        required
      />
      <RadioGroup
        label="Schwerpunktbereich"
        options={['Zahnersatz', 'Zahnbehandlung', 'Kieferorthopädie', 'Kosmetische Eingriffe']}
        value={data.priorityArea}
        onChange={(v) => update('priorityArea', v)}
        required
      />
      <RadioGroup
        label="Hattest du bereits eine Zahnzusatzversicherung?"
        options={['Ja', 'Nein']}
        value={data.previousCoverage}
        onChange={(v) => update('previousCoverage', v)}
        required
      />
    </div>
  );
}

function Step5({ data, setData }) {
  const update = (key, val) => setData({ ...data, [key]: val });
  return (
    <div>
      <StepHeader
        icon="📋"
        title="Beratung & Kontakt"
        subtitle="Fast geschafft! Noch ein paar letzte Angaben für die optimale Beratung."
      />
      <CheckboxGroup
        label="Bevorzugte Kontaktmethode (Mehrfachauswahl möglich)"
        options={['E-Mail', 'Telefon', 'WhatsApp']}
        value={data.contactMethod}
        onChange={(v) => update('contactMethod', v)}
        required
      />
      <CheckboxGroup
        label="Interesse an weiterem Versicherungsschutz?"
        options={['Ambulante Absicherung', 'Stationäre Absicherung', 'Sehhilfen', 'Unfallversicherung', 'Kein weiterer Bedarf']}
        value={data.additionalCoverage}
        onChange={(v) => update('additionalCoverage', v)}
        required
      />
      <CheckboxGroup
        label="Wünschst du eine digitale Beratung zu einem dieser Themen?"
        options={['Finanzanalyse', 'Altersvorsorge', 'Einkommensabsicherung', 'Immobilien & Kapitalanlagen', 'Finanzierung', 'Vermögensaufbau', 'Keine Beratung gewünscht']}
        value={data.consultationTopics}
        onChange={(v) => update('consultationTopics', v)}
        required
      />
    </div>
  );
}

export default function Questionnaire() {
  const [ref, inView] = useInView();
  const cardRef = useRef(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollToCard = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const [personal, setPersonal] = useState({
    name: '', address: '', birthdate: '', maritalStatus: '',
    phone: '', email: '', occupation: '',
  });
  const [insurance, setInsurance] = useState({
    insuranceType: '', insuranceName: '', switchInterest: '', bonusProgram: '',
  });
  const [dental, setDental] = useState({
    dentalTreatment: '', treatmentPlan: '', missingTeeth: '',
    gapInsurance: '', periodontal: '', priorityArea: '', previousCoverage: '',
  });
  const [consultation, setConsultation] = useState({
    contactMethod: [], additionalCoverage: [], consultationTopics: [],
  });

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return personal.name && personal.address && personal.birthdate && personal.maritalStatus && personal.phone && personal.email;
    if (step === 2) return insurance.insuranceType && insurance.insuranceName && insurance.switchInterest;
    if (step === 3) return dental.dentalTreatment && dental.treatmentPlan && dental.missingTeeth && dental.gapInsurance && dental.periodontal && dental.priorityArea && dental.previousCoverage;
    if (step === 4) return consultation.contactMethod.length > 0 && consultation.additionalCoverage.length > 0 && consultation.consultationTopics.length > 0;
    return false;
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      setTimeout(scrollToCard, 50);
    } else {
      setSending(true);
      try {
        await fetch('https://formsubmit.co/ajax/marco.arpa@outlook.de', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: 'Neuer Fragebogen von ' + personal.name,
            '--- PERSÖNLICHE ANGABEN ---': '',
            'Name': personal.name,
            'Adresse': personal.address,
            'Geburtsdatum': personal.birthdate,
            'Familienstand': personal.maritalStatus,
            'Telefon': personal.phone,
            'E-Mail': personal.email,
            'Beruf': personal.occupation || '—',
            '--- KRANKENVERSICHERUNG ---': '',
            'Versicherungsart': insurance.insuranceType,
            'Versicherer': insurance.insuranceName,
            'Wechselinteresse': insurance.switchInterest,
            'Bonusprogramm': insurance.bonusProgram || '—',
            '--- ZAHNSTATUS ---': '',
            'Zahnbehandlung aktuell': dental.dentalTreatment,
            'Heil- und Kostenplan': dental.treatmentPlan,
            'Fehlende Zähne': dental.missingTeeth,
            'Zahnlückenversicherung': dental.gapInsurance,
            'Parodontose': dental.periodontal,
            'Schwerpunkt': dental.priorityArea,
            'Vorherige Zahnzusatzversicherung': dental.previousCoverage,
            '--- BERATUNG & KONTAKT ---': '',
            'Kontaktmethode': consultation.contactMethod.join(', '),
            'Zusätzlicher Versicherungsschutz': consultation.additionalCoverage.join(', '),
            'Beratungsthemen': consultation.consultationTopics.join(', '),
          }),
        });
        setSubmitted(true);
      } catch {
        setSubmitted(true);
      } finally {
        setSending(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setTimeout(scrollToCard, 50);
    }
  };

  if (submitted) {
    return (
      <section id="questionnaire" style={{
        padding: '100px 24px',
        background: 'var(--bg-primary)',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 500, margin: '0 auto',
          animation: 'fadeInUp 0.6s ease',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--accent)',
          }}>✓</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, color: 'var(--text-primary)', marginBottom: 12,
          }}>
            Vielen Dank!
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
            marginBottom: 8,
          }}>
            Deine Angaben sind bei mir eingegangen, {personal.name.split(' ')[0] || 'lieber Kunde'}.
          </p>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            Du erhältst in Kürze ein individuelles Angebot von mir!
          </p>
        </div>
      </section>
    );
  }

  const enabled = canProceed() && !sending;

  return (
    <section id="questionnaire" ref={ref} style={{
      padding: '100px 24px',
      background: 'var(--bg-primary)',
      transition: 'background 0.5s ease',
    }}>
      <div style={{
        maxWidth: 620, margin: '0 auto',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Fragebogen
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, marginBottom: 16, lineHeight: 1.2,
          }}>
            Dein persönliches Angebot
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
            maxWidth: 480, margin: '0 auto',
          }}>
            Fülle den Fragebogen aus und erhalte ein maßgeschneidertes Angebot — kostenlos und unverbindlich.
          </p>
        </div>

        {/* Card */}
        <div ref={cardRef} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20, padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden',
          scrollMarginTop: 24,
        }}>
          <ProgressBar step={step} />

          {/* Step indicator */}
          <div style={{
            fontSize: 12, color: 'var(--text-dim)',
            textAlign: 'right', marginBottom: 16, marginTop: -20,
          }}>
            Schritt {step + 1} von {TOTAL_STEPS}
          </div>

          {/* Step content */}
          <div key={step} style={{ animation: 'fadeInUp 0.4s ease' }}>
            {step === 0 && <Step1 />}
            {step === 1 && <Step2 data={personal} setData={setPersonal} />}
            {step === 2 && <Step3 data={insurance} setData={setInsurance} />}
            {step === 3 && <Step4 data={dental} setData={setDental} />}
            {step === 4 && <Step5 data={consultation} setData={setConsultation} />}
          </div>

          {/* Navigation buttons */}
          <div style={{
            display: 'flex', gap: 12, marginTop: 28,
            flexDirection: step === 0 ? 'column' : 'row',
          }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  flex: 1, padding: '15px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  color: 'var(--text-body)', fontWeight: 600, fontSize: 15,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.3s',
                }}
              >
                ← Zurück
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!enabled}
              style={{
                flex: step === 0 ? 'unset' : 1,
                width: step === 0 ? '100%' : 'auto',
                padding: '15px',
                background: enabled
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                  : 'var(--text-dim)',
                border: 'none', borderRadius: 10,
                color: enabled ? 'var(--bg-primary)' : 'var(--text-muted)',
                fontWeight: 700, fontSize: 15,
                cursor: enabled ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.3s',
                boxShadow: enabled ? '0 4px 30px var(--shadow-accent)' : 'none',
              }}
            >
              {sending ? 'Wird gesendet...' : step === TOTAL_STEPS - 1 ? 'Absenden ✓' : 'Weiter →'}
            </button>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{
          marginTop: 20, textAlign: 'center',
          fontSize: 12, color: 'var(--text-dim)',
        }}>
          🔒 Deine Daten werden verschlüsselt übertragen und vertraulich behandelt.
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section > div > div:last-of-type {
            padding: 24px 18px !important;
          }
        }
      `}</style>
    </section>
  );
}
