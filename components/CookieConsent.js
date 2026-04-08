'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
      padding: '20px 24px',
      animation: 'slideUp 0.4s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{
            fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, margin: 0,
          }}>
            Diese Website verwendet ein technisch notwendiges Cookie zur Speicherung Ihrer
            Theme-Präferenz (Hell-/Dunkelmodus). Es werden keine Tracking- oder Analyse-Cookies eingesetzt.
            Mehr dazu in unserer{' '}
            <a href="/datenschutz" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
              Datenschutzerklärung
            </a>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={decline} style={{
            padding: '10px 20px', borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: 14,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500, transition: 'all 0.3s',
          }}>
            Ablehnen
          </button>
          <button onClick={accept} style={{
            padding: '10px 20px', borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            border: 'none',
            color: 'var(--bg-primary)', fontSize: 14,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700, transition: 'all 0.3s',
            boxShadow: '0 2px 15px var(--shadow-accent)',
          }}>
            Akzeptieren
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
