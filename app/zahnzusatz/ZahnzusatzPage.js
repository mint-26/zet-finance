'use client';

import SiteShell from '../../components/site/SiteShell';
import BrandLight from '../../components/site/BrandLight';
import Process from '../../components/Process';
import Questionnaire from '../../components/Questionnaire';
import CookieConsent from '../../components/CookieConsent';

// Only process and questionnaire live here; intro, about, testimonials and contact
// moved to the start page. Header and footer are the start page's (SiteShell), the
// content always uses the light brand palette (no light/dark switch any more).
export default function ZahnzusatzPage() {
  return (
    <SiteShell base="/">
      <BrandLight>
        <Questionnaire />
        <Process />
        <CookieConsent />
      </BrandLight>
    </SiteShell>
  );
}
