import './App.css';

import Navbar from './sections/Navbar/Navbar';
import Hero from './sections/Hero/Hero';
import CustomCursor from './common/CustomCursor';
import Particles from './common/Particles';
import Atmosphere from './common/Atmosphere';

import { useTheme } from './common/ThemeContext';
import { useMediaQuery } from './common/hooks';
import MoveToTop from './common/MoveToTop';
import AIChatbot from './common/AIChatbot';
import SoundHint from "./common/SoundHint";
import { installUISounds } from "./common/uiSounds";
import { installMagnetic } from "./common/magnetic";
import ClickSparks from "./common/ClickSparks";
import TerminalLauncher from "./common/TerminalLauncher";
import WarpField from "./common/WarpField";
import AchievementToasts from "./common/AchievementToasts";
import { installTabTitle } from "./common/tabTitle";
import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';

// Lazy-load everything below the fold — deferred until needed
const Experience = lazy(() => import('./sections/Experience/Experience'));
const Projects   = lazy(() => import('./sections/Projects/Projects'));
const Skills     = lazy(() => import('./sections/Skills/Skills'));
const Education  = lazy(() => import('./sections/Education/Education'));
const Contact    = lazy(() => import('./sections/Contact/Contact'));
const Footer     = lazy(() => import('./sections/Footer/Footer'));

function App() {
  const { theme } = useTheme();
  const isSmall = useMediaQuery('(max-width: 767px)');

  // Futuristic click / tap sounds (only while sound is on).
  useEffect(() => installUISounds(), []);
  useEffect(() => installMagnetic(), []);
  useEffect(() => installTabTitle(), []);

  // The particle field is decoration: start it once the page has loaded
  // and the browser is idle, so it doesn't compete with first paint.
  const [particlesOn, setParticlesOn] = useState(false);
  useEffect(() => {
    let idle = 0;
    const start = () => {
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(() => setParticlesOn(true), { timeout: 2000 })
        : window.setTimeout(() => setParticlesOn(true), 600);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        {/* Background particles */}
        <div
          className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[1500ms] ${particlesOn ? 'opacity-100' : 'opacity-0'}`}
        >
          {particlesOn && <Particles
            particleColors={
              theme === 'dark'
                ? ['#ffffff']
                : ['#000000']
            }
            particleCount={isSmall ? 50 : 100}
            particleSpread={10}
            speed={0.05}
            particleBaseSize={50}
            moveParticlesOnHover
            reactive
            alphaParticles
            disableRotation={false}
            pixelRatio={1}
          />}
        </div>

        <Atmosphere />

        {/* Portfolio */}
        <div className="relative z-10">
          <Navbar />
          <MoveToTop />
          <AIChatbot />
          <SoundHint />
          <CustomCursor />
          <ClickSparks />
          <WarpField />
          <AchievementToasts />
          <TerminalLauncher />

          <main>
            <div className="section">
              <Hero />
            </div>

            <Suspense fallback={<div className="min-h-screen" />}>
              <div className="section">
                <Experience />
              </div>
              <div className="section">
                <Projects />
              </div>

              <div className="section">
                <Skills />
              </div>

              <div className="education">
                <Education />
              </div>

              <div className="section">
                <Contact />
              </div>

              <Footer />
            </Suspense>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}

export default App;
