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
6. Fertig! Die Seite ist live unter `marcoarpa.com`

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

### Domain

Die Seite laeuft unter `marcoarpa.com`, `www` leitet per 308 darauf um. DNS liegt bei IONOS, die Nameserver bleiben dort, weil auf der Domain auch Marcos E-Mail laeuft. Die URL steht zentral in `lib/site.js`.

### Kontaktformular

Ist angebunden, kein Handlungsbedarf. Beide Formulare schreiben ueber eigene API-Routes nach Supabase und loesen eine Benachrichtigung per Resend aus (`lib/notify.js`). Absender ist `kontakt@marcoarpa.com`, Empfaenger steht in der Umgebungsvariable `NOTIFICATION_EMAIL`.

Benoetigte Umgebungsvariablen in Vercel: `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SECRET`.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)
