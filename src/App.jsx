import './App.css';
import Navbar from './sections/Navbar/Navbar';
import Contact from './sections/Contact/Contact';
import Footer from './sections/Footer/Footer';
import Hero from './sections/Hero/Hero';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';

function App() {
  return (
    <>
      <Navbar />
      <div id="hero" className="section">
        <Hero />
      </div>
      <div id="projects" className="section">
        <Projects />
      </div>
      <div id="skills" className="section">
        <Skills />
      </div>
      <div id="contact" className="section">
        <Contact />
      </div>
      <Footer />
    </>
  );
}

export default App;
