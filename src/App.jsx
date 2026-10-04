import './App.css';

import Navbar from './sections/Navbar/Navbar';
import Contact from './sections/Contact/Contact';
import Footer from './sections/Footer/Footer';
import Hero from './sections/Hero/Hero';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import Education from './sections/Education/Education';
import CustomCursor from './common/CustomCursor';
import Particles from './common/Particles';

import { useTheme } from './common/ThemeContext';

function App() {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen">
      {/* Background particles */}
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

      {/* Portfolio */}
      <div className="relative z-10">
        <Navbar />

        <CustomCursor />

        <div id="hero" className="section">
          <Hero />
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
      </div>
    </div>
  );
}

export default App;