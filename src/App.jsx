import './App.css';
import Navbar from './sections/Navbar/Navbar';
import Contact from './sections/Contact/Contact';
import Footer from './sections/Footer/Footer';
import Hero from './sections/Hero/Hero';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import About from './sections/About/About';
import Education from './sections/Education/Education';
import CustomCursor from './common/CustomCursor';

function App() {
  return (
    <>
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
      <div id='about' className='about'>
        <About/>
      </div>
      <div id='education' className='education'>
        <Education/>
      </div>
      <div id="contact" className="section">
        <Contact />
      </div>
      <Footer />
    </>
  );
}

export default App;
