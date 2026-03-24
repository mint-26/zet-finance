'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '../components/ThemeProvider';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Process from '../components/Process';
import Testimonials from '../components/Testimonials';
import Questionnaire from '../components/Questionnaire';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

function PageContent() {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sections = ['about', 'services', 'process', 'testimonials', 'questionnaire', 'contact'];
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
      <main>
        <Hero />
        <About />
        <Services />
        <Process />
        <Testimonials />
        <Questionnaire />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <PageContent />
    </ThemeProvider>
  );
}
