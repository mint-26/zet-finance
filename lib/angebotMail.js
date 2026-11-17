// Draft of the e-mail that sends an offer to the customer (offer page, "Per E-Mail senden").
// Marco can change every word before sending; this only writes a good first version from the
// lead's data: salutation, the recommended tariff and its advantages, missing teeth, treatments
// already under way and the tariff's special rules. Tariff names stay hidden, like in the offer:
// only Marco's column names (Komfort+, Premium ...) appear.

import { euro, zaehneAnzahl, geburtsjahr } from './tarife';
import { kurzfakten } from './leistungen';
import { CONTACT } from './brand';

const ZAHLWORT = ['keinem', 'einem', 'zwei', 'drei'];
const betrag = (n) => (Number.isInteger(n) ? `${n.toLocaleString('de-DE')} €` : euro(n));
const datum = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function anrede(lead) {
  const teile = String(lead.name || '').trim().replace(/^(dr\.?|prof\.?)\s+/i, '').split(/\s+/).filter(Boolean);
  const letzter = teile.length > 1 ? teile[teile.length - 1] : '';
  const nachname = /\p{L}/u.test(letzter) ? letzter : '';
  if (nachname && lead.geschlecht === 'Weiblich') return `Sehr geehrte Frau ${nachname},`;
  if (nachname && lead.geschlecht === 'Männlich') return `Sehr geehrter Herr ${nachname},`;
  return lead.name ? `Guten Tag ${String(lead.name).trim()},` : 'Guten Tag,';
}

const zahnText = (n) => (n === 1 ? 'ein Zahn fehlt' : `${n} Zähne fehlen`);

// spalten: [{ label, gesellschaft, beitrag (berechneBeitrag), leistungen, sprung }], as on the
// offer page. Returns { betreff, text }.
export function angebotMail({ lead, spalten, empfohlen, notiz, beginn, gueltigBis }) {
  const top = empfohlen >= 0 ? spalten[empfohlen] : null;
  const zaehne = zaehneAnzahl(lead.fehlende_zaehne);
  const zeilen = [anrede(lead), ''];

  zeilen.push(`vielen Dank für Ihr Interesse an einer Zahnzusatzversicherung. Im Anhang finden Sie Ihren persönlichen Vergleich mit ${spalten.length === 1 ? 'einem passenden Tarif' : `${ZAHLWORT[spalten.length] || spalten.length} passenden Tarifen`} für einen Versicherungsbeginn am ${datum(beginn)}.`);

  if (top) {
    zeilen.push('');
    zeilen.push(top.beitrag.ok
      ? `Meine Empfehlung für Sie ist der Tarif ${top.label} für ${euro(top.beitrag.beitrag)} im Monat.`
      : `Meine Empfehlung für Sie ist der Tarif ${top.label}.`);
    if (notiz?.trim()) zeilen.push(notiz.trim());
    // Children's orthodontics only matter for customers under 18.
    const jahr = geburtsjahr(lead.geburtsdatum);
    const kind = jahr && beginn.getFullYear() - jahr < 18;
    const fakten = kurzfakten(top.leistungen, beginn)
      .filter((f) => !f.t.startsWith('Anfangs begrenzt') && f.t !== 'Leistungsangaben folgen' && (kind || !f.t.startsWith('Kieferorthopädie')));
    if (fakten.length) {
      zeilen.push('', `Das bietet Ihnen ${top.label}:`);
      fakten.forEach((f) => zeilen.push(`- ${f.t}`));
    }
  } else {
    zeilen.push('', 'Alle drei Tarife sind übersichtlich mit Beitrag und Leistungen gegenübergestellt.');
  }

  // Things the customer must know before deciding.
  const hinweise = [];
  const bezug = top || spalten[0];
  if (zaehne > 0) {
    if (top && !top.beitrag.ok) {
      hinweise.push(`Da bei Ihnen ${zahnText(zaehne)}, ist ein Abschluss im Tarif ${top.label} leider nicht möglich. Gerne bespreche ich mit Ihnen die Alternativen aus dem Vergleich.`);
    } else if (top?.beitrag.ok && top.beitrag.zuschlag > 0) {
      hinweise.push(`Da bei Ihnen ${zahnText(zaehne)}, enthält der Beitrag einen Risikozuschlag von ${euro(top.beitrag.zuschlag)} im Monat.`);
    } else {
      hinweise.push(`Da bei Ihnen ${zahnText(zaehne)}: Zähne, die schon vor Vertragsbeginn fehlen, sind nur nach den Regeln des jeweiligen Tarifs mitversichert.`);
    }
    if (bezug?.gesellschaft === 'Münchener Verein') hinweise.push('In diesem Tarif ist von den bei Vertragsbeginn fehlenden Zähnen höchstens einer mitversichert.');
  }
  if (String(lead.behandlung || '').startsWith('Ja') || lead.heilkostenplan === 'Ja' || lead.parodontose === 'Ja, aktuell in Behandlung') {
    hinweise.push('Behandlungen, die vor Vertragsbeginn bereits angeraten, geplant oder begonnen wurden, sind von keiner Zahnzusatzversicherung erstattungsfähig. Neue Behandlungen nach Vertragsbeginn sind versichert.');
  }
  const b = bezug?.leistungen?.begrenzung;
  if (b?.staffel) {
    const art = b.periode === 'VJ' ? 'Versicherungsjahren' : 'Kalenderjahren';
    hinweise.push(`In den ersten ${b.staffel.length} ${art} ist die Erstattung auf insgesamt ${betrag(b.staffel[b.staffel.length - 1])} begrenzt (Unfälle ausgenommen), danach entfällt die Begrenzung.`);
  }
  const ohneKasse = bezug?.leistungen?.ohneKasse;
  if (ohneKasse?.t && ohneKasse.s !== 'ja') hinweise.push(ohneKasse.t);
  if (top?.sprung) hinweise.push(`Altersbedingt steigt der Beitrag ab ${datum(top.sprung.ab)} auf ${euro(top.sprung.beitrag)} im Monat.`);

  if (hinweise.length) {
    zeilen.push('', 'Bitte beachten Sie:');
    hinweise.forEach((h) => zeilen.push(`- ${h}`));
  }

  zeilen.push(
    '',
    `Wenn Sie sich für einen Tarif entschieden haben oder Fragen haben, antworten Sie einfach auf diese E-Mail oder schreiben Sie mir per WhatsApp. Ich bereite dann den Antrag vor, den Sie bequem digital unterschreiben. Das Angebot gilt bis ${datum(gueltigBis)}.`,
    '',
    'Viele Grüße',
    'Marco Arpa',
    'Versicherungsmakler nach § 34d GewO',
    `${CONTACT.phone} · ${CONTACT.email} · marcoarpa.com`,
  );

  return { betreff: 'Ihr persönlicher Zahnzusatz-Vergleich', text: zeilen.join('\n') };
}
