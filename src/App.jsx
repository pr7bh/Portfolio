import './App.css';

import Navbar from './sections/Navbar/Navbar';
import Hero from './sections/Hero/Hero';
import CustomCursor from './common/CustomCursor';
import Particles from './common/Particles';

import { useTheme } from './common/ThemeContext';
import MoveToTop from './common/MoveToTop';
import AIChatbot from './common/AIChatbot';
import { useState, lazy, Suspense } from 'react';

// Lazy-load everything below the fold — deferred until needed
const Experience = lazy(() => import('./sections/Experience/Experience'));
const Projects   = lazy(() => import('./sections/Projects/Projects'));
const Skills     = lazy(() => import('./sections/Skills/Skills'));
const Education  = lazy(() => import('./sections/Education/Education'));
const Contact    = lazy(() => import('./sections/Contact/Contact'));
const Footer     = lazy(() => import('./sections/Footer/Footer'));

function App() {
  const { theme } = useTheme();
  // Disable WebGL particles on mobile — avoids competing with FlexCarousel's
  // WebGL context, which can crash or freeze the GPU on low-end phones.
  const [isMobile] = useState(
    () => window.matchMedia('(max-width: 767px)').matches
  );

  return (
    <div className="relative min-h-screen">
      {/* Background particles — desktop only */}
      {!isMobile && (
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Particles
          particleColors={
            theme === 'dark'
              ? ['#ffffff']
              : ['#000000']
          }
          particleCount={100}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={50}
          moveParticlesOnHover
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      )}

      {/* Portfolio */}
      <div className="relative z-10">
        <Navbar />
        <MoveToTop />
        <AIChatbot/>
        <CustomCursor />

        <div id="hero" className="section">
          <Hero />
        </div>

        <Suspense fallback={<div className="min-h-screen" />}>
          <div id="experience" className="section">
            <Experience />
          </div>
          <div id="projects" className="section">
            <Projects />
          </div>

          <div id="skills" className="section">
            <Skills />
          </div>

          <div id="education" className="education">
            <Education />
          </div>

          <div id="contact" className="section">
            <Contact />
          </div>

          <Footer />
        </Suspense>
      </div>
    </div>
  );
}

export default App;