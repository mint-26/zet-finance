# Marco Finanzen — Website

Moderne Landingpage für Marcos Finanzberatung. Gebaut mit Next.js 14, deployed auf Vercel.

## Features

- **Light/Dark Theme** per Knopfdruck (wird im Browser gespeichert)
- **Responsive Design** für Desktop, Tablet & Mobile
- **Kontaktformular** mit Service-Auswahl
- **Terminbuchung** (Calendly-Integration vorbereitet)
- **SEO-optimiert** mit Open Graph Meta-Tags
- **Scroll-Animationen** für alle Sektionen
- **Sticky Navigation** mit aktiver Sektions-Hervorhebung

## Deployment auf Vercel

### Option 1: Via GitHub (empfohlen)

1. Erstelle ein GitHub Repository und pushe den Code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/DEIN-USER/marcos-finanzberatung.git
   git push -u origin main
   ```

2. Gehe zu [vercel.com](https://vercel.com) und logge dich ein
3. Klicke "Add New Project"
4. Importiere dein GitHub Repository
5. Vercel erkennt Next.js automatisch — einfach "Deploy" klicken
6. Fertig! Deine Seite ist live unter `marcos-finanzberatung.vercel.app`

### Option 2: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## Anpassungen

### Marcos echte Daten einsetzen

Alle Platzhalter-Daten findest du in den Komponenten unter `components/`:

- **Services**: `components/Services.js` — Leistungen bearbeiten
- **Testimonials**: `components/Testimonials.js` — Kundenstimmen bearbeiten
- **Kontaktdaten**: `components/Contact.js` — E-Mail, Telefon, Standort
- **Stats**: `components/Hero.js` — Zahlen (500+ Kunden etc.)

### Calendly einbinden

1. Marco erstellt ein Calendly-Konto: [calendly.com](https://calendly.com)
2. In `components/Contact.js` den Calendly-Link eintragen
3. Optional: `npm install react-calendly` für ein eingebettetes Widget

### Custom Domain

1. In Vercel unter "Settings" → "Domains"
2. Eigene Domain hinzufügen (z.B. `marco-finanzen.de`)
3. DNS-Einträge beim Domain-Provider setzen

### Kontaktformular mit Backend verbinden

Das Formular ist aktuell nur Frontend. Optionen:

- **Formspree** (einfachste): [formspree.io](https://formspree.io)
- **Resend** (professionell): [resend.com](https://resend.com)
- **Next.js API Route** (eigenes Backend): Route unter `app/api/contact/route.js`

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)
