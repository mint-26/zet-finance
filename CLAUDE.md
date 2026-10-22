# CLAUDE.md — Marco Arpa Website

## Projekt-Überblick

Website von Marco Arpa, Versicherungsmakler nach § 34d GewO. Gebaut mit Next.js 14 (App Router), deployed auf Vercel.

Seit dem Relaunch (Oktober 2026) gibt es zwei Auftritte in einer App:

- **Hauptseite `/`**: allgemeine Maklerseite im reduzierten Design aus dem Handout (`CI/Handout für Adrian.pdf` im Hauptordner). Komponenten unter `components/site/`, Farben und Schriften in `lib/brand.js`. Kein Hell-Dunkel-Schalter. Abschnitte: Einstieg mit Hintergrundvideo (`public/video/`, H.264 ohne Ton, Quelle `Header_v1.mp4`), Zahnzusatz-Teaser („Damit die Zahnkosten nicht wehtun."; der Button klappt den Fragebogen direkt darunter auf, `components/site/DentalReveal.js`, `/#fragebogen` öffnet ihn sofort), Privat/Unternehmen als zwei Karten auf Verlauf in Graustufen, Über Marco, Kundenstimmen (Daten aus `components/Testimonials.js`), Kontakt mit Formular (`components/site/ContactSection.js`, schickt an `/api/contact`). Texturen aus `CI/Content` liegen in `public/textures/`, Auswahl und Stärke in `components/site/Texture.js`.
- **Zahnzusatz `/zahnzusatz`**: Backup und QR-Code-Ziel, mit Menü und Fußzeile der Hauptseite (`SiteShell`), immer hell in den Brand-Farben (`components/site/BrandLight.js` setzt die alten CSS-Variablen um). Nur noch Fragebogen (`components/Questionnaire.js`, schreibt ins CRM) und „So läuft's ab" (`components/Process.js`, im Layout der Hauptseite). Per `noindex` aus Suchmaschinen heraus. `/zahnkosten` leitet vorläufig (307) dorthin weiter. `components/Hero.js`, `About.js` und `Contact.js` werden aktuell nicht mehr eingebunden.
- **`/erstinformation`**: Entwurf aus den Impressum-Angaben, offene Punkte als „zu prüfen" markiert, bis zur fachlichen Prüfung `noindex` und nicht in der Sitemap.

### Startseiten-Schalter (Notfall-Anker)

`app/page.js` liest die Umgebungsvariable `STARTSEITE`. Steht sie in Vercel auf `zahnzusatz`, zeigt `/` nach einem Redeploy wieder die Zahnzusatz-Seite (mit altem Titel, für Google freigegeben). Ohne Variable kommt die neue Maklerseite. `/zahnzusatz` funktioniert in beiden Fällen. Die Variable wird beim Build gelesen, eine Änderung braucht also immer einen neuen Deploy.

### Logos

`public/logo-black.svg`, `logo-white.svg`, `logo-gold.svg` sind die MA-Dateien aus `CI/` (Wappen mit Namenszug), nur mit eng gesetzter viewBox. `public/wappen-white.svg` ist derselbe weiße Logo-Ausschnitt ohne Namenszug für den Einstieg der Hauptseite. Gold (`#C6A15B`) weicht vom UI-Champagner (`#B5A171`) ab und ist bewusst noch nirgends eingesetzt. Bei Logo-Wechseln den Cache-Buster `?v=` an allen Einbindungen erhöhen.

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
