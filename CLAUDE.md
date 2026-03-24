# CLAUDE.md — Marco Finanzen Website

## Projekt-Überblick

Moderne Landingpage für einen unabhängigen Finanzberater ("Marco"). Ersetzt ein Google Form mit einer vollwertigen, professionellen Web-Präsenz. Gebaut mit Next.js 14 (App Router), deployed auf Vercel.

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

- **Dark (Standard):** Dunkles Navy (#0a0f1a) mit Gold-Akzent (#c8a445)
- **Light:** Warmes Off-White (#f8f6f1) mit dunklerem Gold (#a0822a)

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

## Platzhalter-Daten (müssen ersetzt werden)

| Was | Wo | Aktuell |
|---|---|---|
| Kontaktdaten | `Contact.js` | marco@finanzen.de, +49 123 456 7890 |
| Standort | `Contact.js` | Frankfurt am Main |
| Kundenzahlen | `Hero.js` | 500+, 15+, 100% |
| Testimonials | `Testimonials.js` | 3 fiktive Bewertungen |
| Calendly Link | `Contact.js` | Generischer Link zu calendly.com |
| Impressum/Datenschutz/AGB | `Footer.js` | Verlinken auf `#` |

## Offene Integrationen

### Calendly (Terminbuchung)
In `Contact.js` ist ein Tab "Termin buchen" vorbereitet. Aktuell ein Button-Link. Für echtes Embedding:
```bash
npm install react-calendly
```
Dann in `Contact.js` den Button durch `<InlineWidget url="https://calendly.com/MARCOS-LINK" />` ersetzen.

### Kontaktformular-Backend
Das Formular ist aktuell nur Frontend (State → Success-Screen). Optionen:
1. **Formspree** — Einfachste Variante, kein Code nötig
2. **Resend + Next.js API Route** — Professionell, eigene E-Mail-Templates
3. **Next.js API Route** — `app/api/contact/route.js` mit z.B. Nodemailer

### SEO / Analytics
- Meta-Tags sind in `layout.js` gesetzt
- Google Analytics: Script in `layout.js` einfügen
- Favicon/OG-Image: In `public/` ablegen, in `layout.js` referenzieren

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
