import styles from './HeroStyles.module.css';
import heroImg from '../../assets/prabhjot.png';
import sun from '../../assets/sun.svg';
import moon from '../../assets/moon.svg';
import githubLight from '../../assets/github-light.svg';
import githubDark from '../../assets/github-dark.svg';
import linkedinLight from '../../assets/linkedin-light.svg';
import linkedinDark from '../../assets/linkedin-dark.svg';
import CV from '../../assets/PRABHJOT_SINGH_RESUME.pdf';
import { useTheme } from '../../common/ThemeContext';
import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';


  

  
function Hero() {
  const typedElement = useRef(null);

  useEffect(() => {
    const options = {
      strings: [
        "Full Stack Developer",
        "Web Developer",
        "Software Developer",
        "Backend Developer",
        "Coder",
      ],
      loop: true,
      typeSpeed: 100,
      backSpeed: 80,
      backDelay: 1000,
    };

    const typed = new Typed(typedElement.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  const { theme, toggleTheme } = useTheme();
  const themeIcon = theme === 'light' ? sun : moon;
  const githubIcon = theme === 'light' ? githubLight : githubDark;
  const linkedinIcon = theme === 'light' ? linkedinLight : linkedinDark;


  return (
    
    <section id="hero" className={styles.container}>
      <div className={styles.colorModeContainer}>
        <img
          src={heroImg}
          className={styles.hero}
          alt="Profile picture of Prabhjot Singh"
        />
        <img
          className={styles.colorMode}
          src={themeIcon}
          alt="Color mode icon"
          onClick={toggleTheme}
        />
      </div>
      <div className={styles.info}>
        <h1>
          Prabhjot
          <br />
          Singh
        </h1>
        <div className={styles.movingtext}>
        <h2 className="type-wrapper">
            <span className="role" ref={typedElement}></span>
          </h2>
        </div>
        
        <span>
          
          <a href="https://github.com/pr7bh" target="_blank">
            <img src={githubIcon} alt="Github icon" />
          </a>
          <a href="https://www.linkedin.com/in/prabhjot-singh-40301b243/" target="_blank">
            <img src={linkedinIcon} alt="Linkedin icon" />
          </a>
        </span>
        <p className={styles.description}>
        A distinguished and certified MERN stack developer with a profound expertise in Data Structures and Algorithms (DSA) using Java.
        </p>
        <a href={CV} download>
          <button className="hover">RESUME</button>
        </a>
      </div>
    </section>
  );

}
export default Hero;
