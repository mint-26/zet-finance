'use client';

export default function Footer() {
  return (
    <footer style={{
      padding: '40px 24px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-primary)',
      transition: 'background 0.5s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          © {new Date().getFullYear()} Marco Arpa. Alle Rechte vorbehalten.
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Impressum', 'Datenschutz', 'AGB'].map((l) => (
            <a
              key={l}
              href="#"
              className="footer-link"
              style={{
                fontSize: 13, color: 'var(--text-dim)',
                textDecoration: 'none', transition: 'color 0.3s',
              }}
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .footer-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </footer>
  );
}
