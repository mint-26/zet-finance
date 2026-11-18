# CLAUDE.md — Marco Arpa Website

## Projekt-Überblick

Website von Marco Arpa, Versicherungsmakler nach § 34d GewO. Gebaut mit Next.js 14 (App Router), deployed auf Vercel.

Seit dem Relaunch (Oktober 2026) gibt es zwei Auftritte in einer App:

- **Hauptseite `/`**: allgemeine Maklerseite im reduzierten Design aus dem Handout (`CI/Handout für Adrian.pdf` im Hauptordner). Komponenten unter `components/site/`, Farben und Schriften in `lib/brand.js`. Kein Hell-Dunkel-Schalter. Abschnitte: Einstieg mit Hintergrundvideo (`public/video/`, H.264 ohne Ton, Quelle `Header_v1.mp4`), Zahnzusatz-Teaser („Damit die Zahnkosten nicht wehtun."; der Button klappt den Fragebogen direkt darunter auf, `components/site/DentalReveal.js`, `/#fragebogen` öffnet ihn sofort), Privat/Unternehmen als zwei Karten auf Sandton, darunter das Produktportfolio als Karten-Slider mit Fotos (`components/site/Portfolio.js`, Bilder in `public/portfolio/`, Produktliste noch von Marco zu bestätigen), Über Marco, Kundenstimmen (Daten aus `components/Testimonials.js`), Kontakt mit Formular (`components/site/ContactSection.js`, schickt an `/api/contact`). Texturen aus `CI/Content` liegen in `public/textures/`, Auswahl und Stärke in `components/site/Texture.js`.
- **Zahnzusatz `/zahnzusatz`**: Backup und QR-Code-Ziel, mit Menü und Fußzeile der Hauptseite (`SiteShell`), immer hell in den Brand-Farben (`components/site/BrandLight.js` setzt die alten CSS-Variablen um). Nur noch Fragebogen (`components/Questionnaire.js`, vier Schritte: Einführung und Einwilligung, Zahnstatus, Erwerbsstatus und Krankenversicherung, Persönliches und Kontakt; schreibt ins CRM; Versicherer-Dropdown `components/InsurerSelect.js`, Daten in `lib/insurers.js`, Logos in `public/insurers/`; Anschrift in vier Feldern (PLZ, Ort, Straße, Hausnummer), Ort und Straßenvorschläge über `app/api/adresse/route.js` und die OpenPLZ API, ohne API-Schlüssel, im CRM zusammen in `anschrift`, bei Ausfall bleibt Freitext; Beitragssätze ändern sich meist zum 1. Januar) und „So läuft's ab" (`components/Process.js`, im Layout der Hauptseite). Per `noindex` aus Suchmaschinen heraus. `/zahnkosten` leitet vorläufig (307) dorthin weiter. `components/Hero.js`, `About.js` und `Contact.js` werden aktuell nicht mehr eingebunden.
- **`/erstinformation`**: Entwurf aus den Impressum-Angaben, offene Punkte als „zu prüfen" markiert, bis zur fachlichen Prüfung `noindex` und nicht in der Sitemap.

### Startseiten-Schalter (Notfall-Anker)

`app/page.js` liest die Umgebungsvariable `STARTSEITE`. Steht sie in Vercel auf `zahnzusatz`, zeigt `/` nach einem Redeploy wieder die Zahnzusatz-Seite (mit altem Titel, für Google freigegeben). Ohne Variable kommt die neue Maklerseite. `/zahnzusatz` funktioniert in beiden Fällen. Die Variable wird beim Build gelesen, eine Änderung braucht also immer einen neuen Deploy.

### CRM `/admin`

Drei Hauptreiter (seit 16.11.2026), alle mit derselben Zeitraum-Leiste (`components/admin/Periods.js`: Individuell, Gesamt, Jahre):

- **Leads**: Suche, Filter, Monate und Lead-Liste (Beschreibung unten).
- **Controlling**: die Auswertung (`components/admin/Auswertung.js`, hier immer offen: Ringdiagramm und Tabelle nach Gesellschaft oder Tarif mit Anzahl, Anteil, Summe der Monatsbeiträge und Ø Beitrag (Summe durch Verträge mit bekanntem Beitrag), gezählt wird Status „Versichert“ mit Gesellschaft, siehe `ANTRAG_STATUS`; ein Klick auf eine Gesellschaft klappt die Liste aller dort versicherten Kunden mit Tarif und Beitrag auf, über alle Jahre, ein Name öffnet den Kunden im Reiter Leads; die Ansicht Status zeigt die Anteile aller Leads je Status, ohne Vertragsbestand).
- **Ausnahmen:** Ein Haken „Nicht in Auswertungen zählen“ im Lead (`aus_auswertung`) nimmt den Kunden aus Controlling, Abrechnung und Erhöhungen (`zaehlt`/`isAntrag` in `Auswertung.js`); in der Lead-Liste trägt er das Schild „Nicht in Auswertung“. Seit 18.11.2026 so markiert: Sonia Hosseinzada, Vanousheh Darvish, Katharina Spang, David Stankovic.
- **Abrechnung** (`components/admin/Abrechnung.js`): pro Gesellschaft jeder versicherte Kunde mit Tarif, Beitrag, Provision, Stornoreserve (10 %), Auszahlung und „Abgerechnet“, Summen oben und je Gesellschaft, darunter die Konditionen. Regeln aus Marcos `Provisionsübersicht.pdf` (Stand 16.11.2026) in `lib/provision.js`: Provision = provisionsfähiger Monatsbeitrag × MB-Satz × Faktor (Allianz, AXA, Württembergische 7,20; Münchener Verein 7,80; BBKK 9,90), bei AXA ohne Risikozuschlag. Ein Wert in `provision` (alte Liste, damals 6,80 bzw. 7,80 MB) gilt unverändert. Kunden aus dem Vertragsbestand sind abgerechnet und zählen nur für die Statistik; sie rechnen mit den alten Sätzen (Allianz 6,80 MB, Münchener Verein 6,80 MB bei Beginn vor 02/2026, danach 7,80). Allianz ab 65 wird nur markiert, nicht gekürzt. Noch offen: Bestandsprovision, BBKK Direktanbindung (11 MB), zusätzliche MV-Anbindung.

Angebot (seit 16.11.2026): In den Lead-Details klappt „Angebot erstellen“ (`components/admin/AngebotBuilder.js`) drei Spalten auf: Spaltenname (Vorlage Komfort+, Premium, Premium+), Gesellschaft, Tarif, Empfehlung. „Angebot öffnen“ zeigt `app/admin/angebot/[id]` im Marco-Branding (schwarz, Elfenbein, Champagner, Georgia; Aufbau nach seinen Canva-Angeboten, Design bewusst neu): Seite 1 Kunde, drei Tarifkarten mit Monatsbeitrag zum Beginn am nächsten Monatsersten, Sternen und Kurzfakten, Empfehlung schwarz hervorgehoben, darunter der Chart der Beitragsentwicklung nach Alter (`beitragsVerlauf` in `lib/tarife.js`); danach der Leistungsvergleich in sechs Blöcken (leere Zeilen fallen weg), am Ende Partnerlogos und Kontakt. Keine Gesellschafts- oder Tarifnamen, außer mit Haken. „PDF herunterladen“ holt das PDF von `app/api/angebot/[id]`: Dort rendert Chrome (`@sparticuz/chromium` + `puppeteer-core`, lokal über `CHROME_PATH`) dieselbe Seite mit ihren Druckstilen (A4, zoom 0.82, rund 450 KB, 4 Seiten, klein genug für WhatsApp) und legt es zugleich bei den Dokumenten des Leads ab (Art „Angebot“). Der Druckdialog des Browsers taugt dafür nicht: Safari speichert leere Seiten und druckt die URL mit. Die Angebotsseite nutzt auf dem Bildschirm wie im PDF Gelasio und Arimo (Google Fonts, gleiche Laufweite wie Georgia und Arial), weil es Georgia und Arial auf dem Linux-Server nicht gibt; so sehen Seite und PDF gleich aus. Leistungen je Tarif stehen in `lib/leistungen.js` für die fünf 100er (Allianz MeinZahnschutz 100, AXA Zahn Premium, Münchener Verein ZahnGesund 100, Württembergische ZahnSchutz Premium = ZZ100 + ZZBPlus, BBKK ZahnPRIVAT 100 = UKV-Tarif). Quelle seit 17.11.2026 ist Marcos „Leistungsdatenbank 5 Tarife Vollbedingungen“ (aus den Originalbedingungen); Sterne, Noten sowie Mindestlaufzeit und Kündigung von Allianz und BBKK stammen weiter aus seinem Canva-Angebot. Die Leistungsbegrenzung kennt `periode` 'VJ' (Versicherungsjahre ab Beginn: Allianz, AXA, MV) oder 'KJ' (erstes Jahr endet am 31.12.: BBKK, Württembergische). Fehlt ein Tarif, steht „Angaben folgen“. Gesellschaftsnamen erscheinen im Angebot nur mit Haken „Gesellschaft und Tarif nennen“. Seit 17.11.2026 außerdem: Steht innerhalb eines Jahres nach Beginn eine neue Altersstufe an, zeigt die Karte „ab 01.01.JJJJ: Betrag“; „Angebot gültig bis“ (Tag vor Beginn) steht oben; ein optionaler Freitext „Meine Empfehlung für Sie“ (URL-Parameter `n`, max. 600 Zeichen) erscheint unter den Karten; Leistungszeilen, die bei allen drei Tarifen gleich sind, werden zu „Bei allen Tarifen: …“ zusammengefasst; am Ende „So geht's weiter“ mit WhatsApp-, Telefon- und Mail-Link; die Quelle der Sterne steht in `BEWERTUNG_QUELLE` (`lib/leistungen.js`, von Marco zu bestätigen). Die letzte Auswahl (Tarife, Spaltennamen, Stern, Freitext) speichert das CRM beim Öffnen in `angebot_auswahl` (jsonb) und lädt sie beim nächsten Mal. Im Controlling listet „Altersbedingte Erhöhungen zum 1.1.“ (`components/admin/Erhoehungen.js`) alle versicherten Kunden, deren Tabellenbeitrag zum nächsten 1. Januar steigt.

Angebot per E-Mail (seit 17.11.2026): In der Angebotsansicht öffnet „Per E-Mail senden“ einen Dialog mit Empfänger (E-Mail des Leads), Betreff und einem fertigen, frei änderbaren Text aus `lib/angebotMail.js`: Anrede nach Geschlecht und Nachname, empfohlener Tarif (nur Spaltenname) mit Beitrag, Freitext-Empfehlung und Vorteilen, dann „Bitte beachten Sie“ mit Risikozuschlag bzw. „kein Abschluss möglich“ bei fehlenden Zähnen, MV-Regel (nur ein fehlender Zahn mitversichert), Ausschluss bereits angeratener oder begonnener Behandlungen (laut Fragebogen), Leistungsbegrenzung, Regel ohne Kassenleistung und Beitragssprung. `app/api/angebot/[id]/senden` erzeugt das PDF (`lib/angebotPdf.js`), schickt es per Resend von kontakt@marcoarpa.com (Antworten dorthin, Blindkopie an Marco), legt es bei den Dokumenten ab, setzt einen offenen Lead auf „Angebot verschickt“ und vermerkt den Versand in den Notizen. `ANGEBOT_MAIL_DRY_RUN=1` erzeugt alles, sendet aber nicht.

Versicherungsbeginn (seit 17.11.2026): In den Lead-Details lässt sich „Versicherungsbeginn“ wählen (Monatserste von zwölf Monaten zurück, für rückdatierte Anträge, bis sechs Monate voraus; leer = nächster Monatserster), gespeichert in `vertragsbeginn`. Danach richten sich das tarifliche Alter für den angezeigten Beitrag, `beitrag_abschluss`, die Provision (`stichtagOf` in `lib/provision.js`), das Angebot (URL-Parameter `b`), seine Gültigkeit (Tag vor Beginn, rückdatiert bis Monatsende) und die Angebots-Mail. Helfer `beginnVon`, `datumAusIso`, `standardBeginn` in `lib/tarife.js`.

Vertragsbestand: Die Bestandslisten von Fonds Finanz (Stand 14.11.2026, Allianz, Württembergische, Münchener Verein, Barmenia) sind eingespielt; Continentale hat Marco am 16.11.2026 wieder entfernen lassen. Barmenia-Verträge laufen als „Mehr Zahn 100 + Bonusvorsorge“, ihre Beiträge hat Marco am 18.11.2026 geliefert (in `monatsbeitrag`, 15 Verträge; Patrick Ernst Alter noch ohne). Passende Leads haben `vertragsnummer` und `vertragsbeginn` bekommen, Namen und Geburtsdaten aus dem Vertrag (alte Werte in den Notizen). Kunden ohne Lead stehen mit `quelle = 'bestand'` drin (Name, Geburtsdatum, Gesellschaft, bei Fokusgesellschaften 100er-Tarif und Beitrag zum Vertragsbeginn, `created_at` = Vertragsbeginn). Im Reiter Leads erscheinen sie nur über den Quellen-Filter „Vertragsbestand ohne Anfrage“ oder die Suche, in Controlling und Abrechnung zählen sie mit.

Im Reiter Leads die Monate als Kalenderleiste, je Jahr eine Zeile mit allen 12 Monaten (links Dezember, rechts Januar; ein kleiner Knopf über den Monaten dreht die Reihenfolge um, gemerkt im Browser; Monate ohne Leads blass; schmaler 2 × 6, auf dem Handy 3 × 4), jede Kachel mit Zahl der Leads und offenen; links unter der Zeile des gewählten Monats steht ein schmales Kästchen mit allen Status und ihrer Anzahl, mit einer feinen Linie zum Monat verbunden (`StatusPopover`), darunter seine Leads, zu Beginn der neueste Monat. Die Suche steht ganz oben, über der Zeitraum-Leiste. Wird ein Kunde auf „Versichert“ gesetzt, setzt der Server `abgeschlossen_am`: Der Lead zählt dann zu diesem Monat und steht dort oben, auch in der Auswertung (`leadDate` in `Periods.js`). Wird der Status zurückgenommen, geht er zurück in den Monat seiner Anfrage. Meldet sich ein Kunde ohne Abschluss wieder, holt ihn der Knopf „In aktuellen Monat holen“ nach oben (`wieder_aktiv_am`, rückgängig machbar). Die Suche läuft über alle Jahre. Ein Klick auf die Kundenzeile öffnet die Details; dort lassen sich unter „Kundenangaben“ alle Angaben korrigieren (bei Gesprächen Name, Telefon, Anliegen), Antworten mit denselben Auswahllisten wie im Fragebogen, Krankenkasse mit demselben Dropdown. Die Listen stehen zentral in `lib/fragebogen.js` (Formular, CRM und Server-Prüfung in `app/api/submissions/[id]/route.js`); wer eine Antwort im Formular ändert, ändert sie dort. Gesellschaften mit Logos und späteren Tarifen in `lib/gesellschaften.js`, pro Kunde gespeichert in `gesellschaft` und `tarif`; Für die fünf Fokusgesellschaften (Allianz, AXA, Münchener Verein, Württembergische, BBKK) kommen Tarife, Monatsbeiträge nach Altersstufe und Risikozuschläge für fehlende Zähne aus `lib/tarife.js` (Quelle: Marcos PDF, Erfassungsstand 13.11.2026; Preisänderungen nur dort eintragen). Ohne Tarifangabe gilt immer der 100er (`standard: true` in `lib/tarife.js`, bei AXA Zahn Premium): Die Auswahl springt beim Wählen der Gesellschaft darauf, der Server trägt ihn bei leerem Tarif ein, Beitrag und Auswertung rechnen damit. Dort ist der Tarif eine Auswahl, daneben stehen „Beitrag“ (aus Tarif, Geburtsjahr und fehlenden Zähnen) und „Altersbedingte Erhöhung“ (nächste Altersstufe mit anderem Beitrag, gilt ab 1. Januar des Jahres, in dem der Kunde sie erreicht; tarifliches Alter = Kalenderjahr minus Geburtsjahr). Ohne bezifferten Zuschlag gibt es keinen; ab 4 fehlenden Zähnen meldet das CRM bei Allianz, Württembergische und BBKK „kein Abschluss möglich“. Beim Abschluss speichert der Server den Beitrag in `beitrag_abschluss` (Alter im Jahr des Abschlusses, inkl. Zuschlag; folgt Tarif und Angaben, solange der Status „Versichert“ ist, wird beim Zurücknehmen geleert; spätere Preisänderungen in `lib/tarife.js` ändern ihn nicht). Bei versicherten Kunden zeigt das Feld „Beitrag“ zuerst `monatsbeitrag` (Marcos Wert aus der alten Liste, 32 Kunden, wie `provision` nur in der Datenbank und im Excel), sonst `beitrag_abschluss`. Bei allen anderen Gesellschaften ist der Tarif Freitext mit Vorschlägen aus den bisherigen Einträgen. Der Knopf „Abgerechnet / Nicht abgerechnet“ in der Lead-Zeile erscheint seit 18.11.2026 nur bei Status „Versichert“ (der Platz bleibt sonst leer, damit die Zeilen fluchten). Die Felder „Vertrag gekündigt“ und „Kündigungsbestätigung“ sind seit 14.11.2026 ausgeblendet, die Spalten bleiben in der Datenbank.

Dokumente pro Lead (`components/admin/Dokumente.js`, Regeln in `lib/dokumente.js`): Dateien im privaten Supabase-Bucket `lead-dokumente`, Angaben in der Tabelle `lead_dokumente`. Der Browser lädt direkt zu Supabase hoch, über einen einmaligen Link aus `app/api/submissions/[id]/dokumente/route.js`, weil Vercel-Funktionen höchstens 4,5 MB annehmen. Beim Löschen eines Leads werden seine Dateien mitgelöscht. Der Backup-Knopf (`components/admin/Backup.js`, `lib/zip.js`) baut im Browser eine ZIP mit Excel-Liste und einem Ordner pro Lead. Speicherkontingent in `lib/dokumente.js` (Free: 1 GB, bei Planwechsel anpassen). Supabase-Backups enthalten keine Dateien, der Knopf ist also die einzige Sicherung der Dokumente.

### Sprachen (Deutsch und Englisch)

Der Schalter DE | EN (`LanguageSwitch` in `components/LanguageProvider.js`) sitzt im Kopf von `SiteShell` und der Rechtsseiten, die Wahl liegt im `localStorage` (`marco-lang`). Deutsch steht direkt in den Komponenten, `t('deutscher Text')` holt die englische Fassung aus `lib/translations.js`. Fehlt ein Eintrag, erscheint der deutsche Text. Wer einen deutschen Text aendert, muss also auch den Schluessel dort aendern. Impressum, Datenschutz und Nutzungsbedingungen haben ihre englische Fassung in `components/legal/en.js`, dort gilt ausdruecklich die deutsche als verbindlich. Antworten aus Fragebogen und Kontaktformular bleiben auf Deutsch, damit das CRM einheitlich bleibt: uebersetzt wird nur die Anzeige, nie der Wert. Nicht uebersetzt: `/admin`, die Lead-Mails, der WhatsApp-Bot und die Metadaten fuer Suchmaschinen.

### Logos

`public/logo-black.svg`, `logo-white.svg`, `logo-gold.svg` sind die MA-Dateien aus `CI/Content/Logo` (Stand 23.10.2026: `8.svg` Schwarz, `9.svg` Weiß, `7.svg` Gold; Wappen mit Namenszug), nur mit eng gesetzter viewBox. `public/wappen-white.svg` ist ein älterer weißer Ausschnitt ohne Namenszug und aktuell nicht eingebunden. Gold (`#C6A15B`) weicht vom UI-Champagner (`#B5A171`) ab und ist bewusst noch nirgends eingesetzt. Bei Logo-Wechseln den Cache-Buster `?v=` an allen Einbindungen erhöhen.

## Tech Stack

- **Framework:** Next.js 14 (App Router, `'use client'` Components)
- **Sprache:** JavaScript (kein TypeScript)
- **Styling:** Inline Styles + CSS Custom Properties (keine CSS-Module, kein Tailwind)
- **Fonts:** Playfair Display (Headings) + DM Sans (Body) via Google Fonts
- **Deployment:** Vercel
- **Node:** >=18

## Projektstruktur

```
marcos-finanzberatung/
├── app/
│   ├── globals.css          # CSS Variables (Light/Dark), Keyframes, Scrollbar
│   ├── layout.js            # Root Layout mit Metadata + SEO
│   └── page.js              # Hauptseite, assembliert alle Sections
├── components/
│   ├── ThemeProvider.js      # React Context für Light/Dark Toggle
│   ├── useInView.js          # IntersectionObserver Hook für Scroll-Animationen
│   ├── Nav.js                # Sticky Nav mit Theme-Toggle + Mobile Burger
│   ├── Hero.js               # Hero Section mit CTA + Stats
│   ├── Services.js           # 4 Leistungskarten
│   ├── Process.js            # 4-Schritte Ablauf
│   ├── Testimonials.js       # Kundenstimmen
│   ├── Contact.js            # Kontaktformular + Calendly Tab
│   └── Footer.js             # Footer mit Rechtslinks
├── public/                   # Statische Assets (aktuell leer)
├── package.json
├── next.config.js
├── vercel.json
└── .gitignore
```

## Befehle

```bash
npm install          # Dependencies installieren
npm run dev          # Dev Server starten (localhost:3000)
npm run build        # Production Build
npm run start        # Production Server
vercel               # Deploy auf Vercel (CLI)
```

## Design-System

### Farbschema

Das gesamte Theming läuft über CSS Custom Properties in `globals.css`. Zwei Themes:

- **Dark (Standard):** Grau (#494949) mit Champagner der Hauptseite (#B5A171)
- **Light:** Hellgrau (#e8e8e8) mit dunklem Champagner (#7D6D49)

Theme wird per `data-theme="light"` auf `<html>` gesetzt und im `localStorage` persistiert.

Wichtige Variables:
- `--bg-primary`, `--bg-secondary`, `--bg-card`
- `--accent`, `--accent-light`, `--accent-dim`
- `--text-primary`, `--text-body`, `--text-muted`, `--text-dim`
- `--border`, `--border-strong`
- `--shadow-accent`, `--nav-bg`

### Typografie

- Headings: `'Playfair Display', serif` (600, 700, 800)
- Body: `'DM Sans', sans-serif` (400, 500, 600, 700, 800)
- Keine System-Fonts, kein Inter, kein Roboto

### Animationen

- Scroll-reveal via `useInView` Hook (IntersectionObserver)
- Staggered delays: `${i * 0.1}s` pro Karte/Element
- Cubic-bezier: `0.16, 1, 0.3, 1` für smooth ease-out
- Hero fade-in: 150ms verzögert nach Mount
- Theme-Transition: 0.5s ease auf background + color

## Architektur-Entscheidungen

- **Inline Styles statt CSS-Module:** Gewollt. Jede Komponente ist self-contained, Theming über CSS Variables. Kein Build-Step für Styles nötig.
- **Kein TypeScript:** Bewusst einfach gehalten, Marco soll Inhalte bearbeiten können ohne TS-Fehler.
- **`'use client'` überall:** Alle Komponenten brauchen Browser-APIs (IntersectionObserver, localStorage, useState). SSR wäre Overengineering für eine Landingpage.
- **Keine externe State-Library:** React Context reicht für Theme-Toggle.
- **styled-jsx für Hover-States:** Inline Styles können kein `:hover`, daher `<style jsx>` Blöcke für interaktive States.

## Domain und Deployment

Live unter **marcoarpa.com** (seit 01.09.2026), `www` leitet per 308 auf die Hauptdomain um. Ein Vercel-Projekt: `marcos-finanzberatung`. Die Domain-URL steht zentral in `lib/site.js` und wird von Metadata, Sitemap, robots.txt und den Lead-Mails genutzt.

DNS liegt bei IONOS. Die Nameserver bleiben dort, weil auf der Domain Marcos E-Mail laeuft (MX auf ionos.de). Aenderungen am DNS also immer daraufhin pruefen, ob sie die Mail-Records auf dem Apex beruehren.

## Platzhalter-Daten (noch zu pruefen)

| Was | Wo | Aktuell |
|---|---|---|
| Kundenzahlen | `Hero.js` | 500+, 7+, 100% |
| Testimonials | `Testimonials.js` | 3 Bewertungen mit abgekuerzten Namen |

Kontaktdaten, Standort und die Rechtsseiten sind echt und gepflegt: `kontakt@marcoarpa.com`, +49 152 5461 1314, Frankfurt am Main. Impressum, Datenschutz und AGB sind eigene Seiten unter `app/`, keine Platzhalter-Links mehr.

## Integrationen

### Kontaktformular und Fragebogen (erledigt)
Beide Formulare laufen ueber eigene API-Routes: `app/api/contact/route.js` und `app/api/submissions/route.js`. Leads landen in Supabase, die Benachrichtigung geht per Resend an `NOTIFICATION_EMAIL`. Der Versand steckt in `lib/notify.js` samt Retry mit Backoff.

Absender ist `kontakt@marcoarpa.com` ueber die in Resend verifizierte Domain, also dieselbe Adresse, die auch Empfaenger ist. SPF und Return-Path liegen auf der Subdomain `send.marcoarpa.com`, damit sie nicht mit den IONOS-Mail-Records auf dem Apex kollidieren.

### WhatsApp-Bot (Stand 23.10.2026: lokal getestet, noch nicht live verbunden)
Regelbasierter Bot ohne KI. Er startet nur, wenn ein Chat mit dem vorausgefüllten Text aus `lib/whatsapp/link.js` beginnt („… über marcoarpa.com“), also über den Link in der Fußzeile oder einen QR-Code. Alle anderen Nachrichten an die Nummer beantwortet Marco selbst. Erst fragt der Bot: Zahnzusatz-Angebot oder Gespräch. Zahnzusatz holt zuerst die Einwilligung und geht dann den Fragebogen durch (gleiche Werte wie `components/Questionnaire.js`). Gespräch fragt nur Name und Anliegen. Beides landet in `zahnzusatz_submissions` mit `quelle = 'whatsapp'` und `anfrage_typ`, die Mail geht wie gewohnt über `lib/notify.js`. Danach schweigt der Bot und Marco antwortet in der Business-App.

- `app/api/whatsapp/route.js` ist der Webhook (GET-Verifizierung, POST-Nachrichten). Dialog in `lib/whatsapp/flow.js`, Ablauf und Speicherung in `lib/whatsapp/bot.js`, Versand in `lib/whatsapp/api.js`. Web und WhatsApp speichern beide über `lib/submissions.js`.
- Gesprächszustand in `whatsapp_conversations`, schon verarbeitete Nachrichten in `whatsapp_seen_messages`. Unfertige Chats werden nach 30 Tagen gelöscht. Schreibt Marco während eines laufenden Bot-Dialogs selbst (Coexistence-Echo), pausiert der Bot für diesen Kontakt.
- Bot-Vorschau ohne WhatsApp: `/admin/whatsapp`. Tests landen im CRM als „WhatsApp (Test)“ und lösen keine Mail aus.
- Umgebungsvariablen: `WHATSAPP_PROVIDER` (`meta`, `360dialog` oder `360dialog-sandbox`), `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` (nur Meta), `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` (Meta signiert die Webhooks) oder `WHATSAPP_WEBHOOK_KEY` (360dialog, Webhook-URL mit `?key=`), `NEXT_PUBLIC_WHATSAPP_NUMBER` (Nummer für den Fußzeilen-Link; ohne sie gibt es keinen Link). `WHATSAPP_DRY_RUN=1` schreibt nur ins Log statt zu senden.
- Test: Metas Testnummer ließ sich am 23.10.2026 nicht anlegen (Fehler beim Erstellen des Testkontos). Stattdessen die kostenlose 360dialog-Sandbox: „START“ per WhatsApp an +55 11 4673-3492 schicken, man bekommt einen API-Schlüssel, Webhook per `POST https://waba-sandbox.360dialog.io/v1/configs/webhook` setzen. Grenzen: antwortet nur der eigenen Nummer, insgesamt 200 Nachrichten (ein Zahnzusatz-Durchlauf braucht etwa 25). Im Sandbox-Modus kommen Auswahlfragen als Nummernliste, Leads gelten als Test (Quelle „WhatsApp (Test)“, keine Mail).
- Plan: Für Marcos echte Nummer mit Coexistence (Nummer bleibt in seiner Business-App) über 360dialog, dafür nur die Variablen tauschen. Kosten: ab der 1.001. Antwortnachricht im Monat pro Nummer zahlt Meta-Tarif (seit 01.10.2026).

### Terminbuchung
Calendly ist **nicht** eingebunden, im Code gibt es keinen Verweis darauf. Falls gewuenscht, muesste das neu gebaut werden.

### SEO
- `metadataBase`, Canonical und OpenGraph-URL in `app/layout.js`, gespeist aus `lib/site.js`
- `app/robots.js` erzeugt robots.txt, schliesst `/admin` und `/api/` aus
- `app/sitemap.js` erzeugt sitemap.xml mit Startseite und den drei Rechtsseiten
- Google Search Console verifiziert per Datei `public/google68817280ddcea0ce.html` (muss liegen bleiben)
- Google Analytics ist nicht eingebunden

## Code-Konventionen

- Deutsche UI-Texte, englische Code-Kommentare wenn nötig
- Keine em-dashes im Content
- Komponenten-Namen: PascalCase
- CSS Variables: kebab-case mit `--` Prefix
- Keine Bullet-Points-Patterns im Code (flache Datenstrukturen als Arrays)
- `const` statt `let` wo möglich
- Keine unnötigen Dependencies

## Responsive Breakpoints

- **Desktop:** > 768px — Full Navigation, Grid-Layouts
- **Mobile:** ≤ 768px — Burger-Menu, Single-Column, step-arrows hidden
- Grid-Breakpoints via `repeat(auto-fit, minmax(Xpx, 1fr))`

## Known Gotchas

- `styled-jsx` ist Next.js built-in, braucht keine Installation
- Theme-Flash vermieden durch `visibility: hidden` bis `mounted` State
- Select-Dropdowns brauchen explizites `background` auf `<option>` für Dark Mode
- Google Fonts via CSS `@import` in `globals.css`, nicht via `next/font` (einfacher für Marco)
