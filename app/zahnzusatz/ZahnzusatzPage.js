'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '../../components/ThemeProvider';
import Nav from '../../components/Nav';
import Process from '../../components/Process';
import Questionnaire from '../../components/Questionnaire';
import Footer from '../../components/Footer';
import CookieConsent from '../../components/CookieConsent';

function PageContent() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sections = ['process', 'fragebogen'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Nav activeSection={activeSection} />
      {/* Only process and questionnaire live here; intro, about, testimonials
          and contact moved to the start page. Top padding clears the fixed nav. */}
      <main style={{ paddingTop: 72 }}>
        <Process />
        <Questionnaire />
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}

export default function ZahnzusatzPage() {
  return (
    <ThemeProvider autoSchedule>
      <PageContent />
    </ThemeProvider>
  );
}
