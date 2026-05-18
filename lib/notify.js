// Server-side notification helper.
// Sends a payload to FormSubmit.co with retry + backoff + per-attempt timeout.
// Worst-case wall time: ~16 s (3 attempts * 4 s timeout + 1 s + 3 s backoff).

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/marco.arpa@outlook.de';

export async function sendFormSubmitNotification(payload, opts = {}) {
  const {
    maxAttempts = 3,
    timeoutMs = 4000,
    backoffMs = [1000, 3000], // delay BEFORE attempt 2 and 3
    url = FORMSUBMIT_URL,
  } = opts;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      const delay = backoffMs[attempt - 2] ?? backoffMs[backoffMs.length - 1];
      await sleep(delay);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // FormSubmit's AJAX endpoint behaves like an XHR call — sending
      // Origin/Referer/User-Agent like the browser did historically avoids
      // anti-bot rejections (HTTP 403) on server-side calls.
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; marcos-finanzberatung-server/1.0)',
          'Origin': 'https://marco-arpa.vercel.app',
          'Referer': 'https://marco-arpa.vercel.app/',
        },
        body: JSON.stringify({ _captcha: 'false', ...payload }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        // FormSubmit returns { success: "true", message: "..." } on accept.
        if (data && (data.success === 'true' || data.success === true)) {
          return { success: true, attempts: attempt };
        }
        lastError = `unexpected response: ${truncate(JSON.stringify(data))}`;
      } else {
        const bodyText = await res.text().catch(() => '');
        lastError = `HTTP ${res.status}${bodyText ? ` — ${truncate(bodyText, 250)}` : ''}`;
      }
    } catch (err) {
      clearTimeout(timer);
      lastError = err?.name === 'AbortError'
        ? `timeout after ${timeoutMs}ms`
        : `${err?.name || 'Error'}: ${err?.message || 'unknown'}`;
    }
  }

  return { success: false, attempts: maxAttempts, lastError };
}

// Build the FormSubmit payload from a stored questionnaire row.
// Mirrors the historical browser-side payload so Marco's mail layout stays consistent.
export function buildQuestionnairePayload(row) {
  return {
    _subject: 'Neues Zahnzusatz-Angebot: ' + (row.name || '(ohne Namen)'),
    'Vor- und Nachname': row.name || '—',
    'Anschrift': row.anschrift || '—',
    'Geburtsdatum': row.geburtsdatum || '—',
    'Familienstand': row.familienstand || '—',
    'Telefon': row.telefon || '—',
    'E-Mail': row.email || '—',
    'Beruf': row.beruf || '—',
    'Krankenversicherungsart': row.versicherungsart || '—',
    'Krankenkasse': row.krankenkasse || '—',
    'Kassenwechsel': row.wechsel || '—',
    'Bonusprogramm': row.bonusprogramm || '—',
    'Aktuelle Behandlung': row.behandlung || '—',
    'Heil- und Kostenplan': row.heilkostenplan || '—',
    'Fehlende Zähne': row.fehlende_zaehne || '—',
    'Zahnlücke mitversichern': row.zahnluecke || '—',
    'Parodontose': row.parodontose || '—',
    'Schwerpunktbereich': row.schwerpunkt || '—',
    'Vorherige Zahnversicherung': row.vorherige_versicherung || '—',
    'Kontaktweg': row.kontaktweg || '—',
    'Zusatzversicherungen': row.zusatzversicherung || '—',
    'Beratungstermin': row.beratungstermin || '—',
  };
}

export function buildContactPayload(form) {
  return {
    _subject: 'Neue Kontaktanfrage von ' + (form.name || '(ohne Namen)'),
    'Name': form.name || '—',
    'E-Mail': form.email || '—',
    'Telefon': form.phone || '—',
    'Bereich': form.service || '—',
    'Nachricht': form.message || '—',
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncate(s, max = 200) {
  if (typeof s !== 'string') return String(s);
  return s.length > max ? s.slice(0, max) + '…' : s;
}
