import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
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
            <Hero />
            <ScrollReveal><About /></ScrollReveal>
            <ScrollReveal><Skills /></ScrollReveal>
            <ScrollReveal><Projects /></ScrollReveal>
            <ScrollReveal><Experience /></ScrollReveal>
            <ScrollReveal><Certifications /></ScrollReveal>
            <ScrollReveal><GitHubTracker /></ScrollReveal>
            <ScrollReveal><Testimonials /></ScrollReveal>
            <ScrollReveal><Contact /></ScrollReveal>
          </main>

          <Footer />
          <AIAssistant />
          <BackToTop />
        </motion.div>
      )}
    </>
  );
}
