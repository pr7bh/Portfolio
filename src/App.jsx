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
import { lazy, Suspense } from 'react';
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen">
        {/* Background particles */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <Particles
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
            alphaParticles
            disableRotation={false}
            pixelRatio={1}
          />
        </div>

        <Atmosphere />

        {/* Portfolio */}
        <div className="relative z-10">
          <Navbar />
          <MoveToTop />
          <AIChatbot />
          <CustomCursor />

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
