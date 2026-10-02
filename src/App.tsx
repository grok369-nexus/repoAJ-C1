import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Certifications from './components/Certifications';
import GitHubTracker from './components/GitHubTracker';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import BackToTop from './components/BackToTop';
import ScrollProgressBar from './components/ScrollProgressBar';
import ScrollReveal from './components/ScrollReveal';
import './site-polish.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved && ['blue', 'gold', 'green', 'red', 'pink', 'white', 'mixed'].includes(saved)) return saved;
    }
    return 'mixed';
  });

  useEffect(() => {
    const classes = ['theme-blue', 'theme-gold', 'theme-green', 'theme-red', 'theme-pink', 'theme-white', 'theme-mixed'];
    document.documentElement.classList.remove(...classes);
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  return (
    <>
      <LoadingScreen onComplete={() => setIsLoading(false)} />
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`site-shell min-h-screen text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-300 theme-${theme}`}
          >
            <div className="site-ambient" aria-hidden="true">
              <div className="site-orb site-orb-one" />
              <div className="site-orb site-orb-two" />
              <div className="site-grid" />
            </div>
            <ScrollProgressBar />
            <Navbar theme={theme} onThemeChange={setTheme} />
            <main className="relative z-10">
              <AnimatePresence mode="wait"><motion.div key={`hero-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}><Hero /></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`about-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}><ScrollReveal><About /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`skills-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}><ScrollReveal><Skills /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`projects-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}><ScrollReveal><Projects /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`experience-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 1, 1] }}><ScrollReveal><Experience /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`certs-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 1, 1] }}><ScrollReveal><Certifications /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`github-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 1, 1] }}><ScrollReveal><GitHubTracker /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`testimonials-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 1, 1] }}><ScrollReveal><Testimonials /></ScrollReveal></motion.div></AnimatePresence>
              <AnimatePresence mode="wait"><motion.div key={`contact-${theme}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5, ease: [0.16, 1, 1, 1] }}><ScrollReveal><Contact /></ScrollReveal></motion.div></AnimatePresence>
            </main>
            <Footer />
            <AIAssistant />
            <BackToTop />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
