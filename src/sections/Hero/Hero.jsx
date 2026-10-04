import githubLight from "../../assets/github-light.svg";
import githubDark from "../../assets/github-dark.svg";
import linkedinLight from "../../assets/linkedin-light.svg";
import linkedinDark from "../../assets/linkedin-dark.svg";
import CV from "../../assets/cv.pdf";
import heroImage from "../../assets/hero.png";
import SpecularButton from "../../common/SpecularButton";

import { useTheme } from "../../common/ThemeContext";
import { useEffect, useRef } from "react";
import Typed from "typed.js";
import ScrollExpand from "../../common/ScrollExpand";

function Hero() {
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: [
        "Full Stack Developer",
        "React.js Developer",
        "FastAPI Developer",
        "GenAI Developer",
      ],
      loop: true,
      typeSpeed: 100,
      backSpeed: 80,
      backDelay: 1000,
    });

    return () => typed.destroy();
  }, []);

  const { theme } = useTheme();

  const githubIcon = theme === "light" ? githubLight : githubDark;
  const linkedinIcon = theme === "light" ? linkedinLight : linkedinDark;

  return (
    <section id="hero" className="w-full">
      <ScrollExpand
        src={heroImage}
        alt="Prabhjot Singh"
        title="PRABHJOT SINGH"
        useWindowScroll
        startWidth={55}
        startHeight={55}
        startRadius={28}
        endRadius={0}
        mediaZoom={1.1}
        scrollDistance={1.2}
        holdDistance={0.25}
        smoothing={0.1}
        overlayScrim={0.4}
        enabled
      >
        {/* Dark image overlay */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-black/20
            via-black/10
            to-black/50
          "
        />

        {/* EVERYTHING IS DIRECTLY ON THE IMAGE */}
        <div
          className="
            relative
            z-10
            flex
            min-h-screen
            w-full
            flex-col
            items-center
            justify-center
            px-6
            py-24
            text-center
            text-white
          "
        >
          {/* Name */}
          <h1
            className="
              text-5xl
              font-bold
              tracking-tight
              drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]
              sm:text-6xl
              md:text-7xl
              lg:text-8xl
            "
          >
            Prabhjot Singh
          </h1>

          {/* Main Role */}
          <p
            className="
              mt-4
              text-xl
              font-semibold
              tracking-wide
              text-white
              drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]
              sm:text-2xl
              md:text-3xl
            "
          >
            Software Developer
          </p>

          {/* Typed Roles */}
          <div className="mt-1 min-h-[45px]">
            <h2
              className="
                text-lg
                font-medium
                text-white/85
                drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]
                sm:text-xl
                md:text-2xl
              "
            >
              <span ref={typedElement} />
            </h2>
          </div>

          {/* Social Links */}
          <div className="mt-7 flex items-center gap-5">
            <a
              href="https://github.com/pr7bh"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-110
              "
            >
              <img src={githubIcon} alt="GitHub" className="w-6" />
            </a>

            <a
              href="https://www.linkedin.com/in/prabhjot-singh-40301b243/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                
                transition-all
                duration-300
                hover:-translate-y-1
                hover:scale-110
              "
            >
              <img src={linkedinIcon} alt="LinkedIn" className="w-6" />
            </a>
          </div>

          {/* Description directly on image */}
          <p
            className="
              mt-7
              max-w-[650px]
              text-sm
              leading-7
              text-white/90
              drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]
              sm:text-base
              md:text-lg
            "
          >
            Software developer with 2+ years of experience building performant,
            data-heavy web applications for energy and geospatial platforms. I
            also build GenAI applications using LLMs, RAG, FastAPI, Gemini, and
            modern React.js technologies.
          </p>

          {/* CV */}
          {/* CV */}
          <div className="mt-7">
            <SpecularButton
              size="lg"
              radius={18}
              tint="#ffffff"
              tintOpacity={0}
              blur={0}
              textColor="#f5f5f5"
              lineColor="#ffffff"
              baseColor="#525252"
              intensity={1}
              shineSize={10}
              shineFade={40}
              thickness={1}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
              onClick={() => window.open(CV, "_blank", "noopener,noreferrer")}
            >
              View CV
            </SpecularButton>
          </div>

          {/* Scroll hint */}
          <div
            className="
              absolute
              bottom-7
              left-1/2
              flex
              -translate-x-1/2
              flex-col
              items-center
              gap-1
              text-[10px]
              uppercase
              tracking-[0.3em]
              text-white/80
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]
            "
          >
            <span>Scroll to explore</span>

            <span className="animate-bounce text-xl">↓</span>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}

export default Hero;
