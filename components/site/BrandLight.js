'use client';

import { C, SERIF, SANS } from '../../lib/brand';

// Maps the old theme variables (app/globals.css) onto the light brand palette, so
// components from the old design (questionnaire, cookie notice) match the main site.
// Used on the start page (unfolding questionnaire) and on /zahnzusatz.
export default function BrandLight({ children, style }) {
  return (
    <div className="brand-light" style={style}>
      {children}
      <style jsx global>{`
        .brand-light {
          --bg-primary: ${C.ivory};
          --bg-secondary: #E9E5DB;
          --bg-card: #F6F4EE;
          --text-primary: ${C.black};
          --text-body: ${C.black};
          --text-muted: ${C.graphite};
          --text-dim: #8C877E;
          --input-bg: #FFFFFF;
          --select-option-bg: #FFFFFF;
          --success: #3E7B4F;
          --accent: ${C.champagneDark};
          --accent-light: ${C.champagneDark};
          --accent-dim: rgba(125,109,73,0.1);
          --border: rgba(9,9,9,0.14);
          --border-strong: rgba(9,9,9,0.3);
          --shadow-accent: rgba(125,109,73,0.18);
          --step-num: rgba(125,109,73,0.35);
          background: #E9E5DB;
          color: ${C.black};
          font-family: ${SANS};
        }
        .brand-light #fragebogen h2, .brand-light #fragebogen h3 { font-family: ${SERIF} !important; font-weight: 400 !important; }
      `}</style>
    </div>
  );
}
