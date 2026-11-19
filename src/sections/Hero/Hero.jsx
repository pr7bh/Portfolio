import githubLight from "../../assets/github-light.svg";
import githubDark from "../../assets/github-dark.svg";
import linkedinLight from "../../assets/linkedin-light.svg";
import linkedinDark from "../../assets/linkedin-dark.svg";
import CV from "../../assets/cv.pdf";
import heroImage from "../../assets/hero.jpg";
import SpecularButton from "../../common/SpecularButton";

import { useTheme } from "../../common/ThemeContext";
import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import ScrollExpand from "../../common/ScrollExpand";
import HeroPortal from "../../common/HeroPortal";
import { Magnetic } from "../../common/Interactive";
import { IconPhone } from "@tabler/icons-react";
import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1];

function HeroTitle() {
  let n = 0;
  return (
    <div className="flex flex-col items-center gap-[0.4em]">
      <span className="sr-only">Prabhjot Singh</span>
      <span aria-hidden="true" className="flex flex-wrap justify-center gap-x-[0.28em]">
        {["PRABHJOT", "SINGH"].map((word) => (
          <span key={word} className="inline-flex overflow-hidden pb-[0.06em]">
            {[...word].map((ch) => {
              const i = n++;
              return (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: 0.7 + i * 0.045, ease }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        ))}
      </span>
      <motion.span
        aria-hidden="true"
        className="meta"
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={{ opacity: 1, letterSpacing: "0.32em" }}
        transition={{ duration: 1.6, delay: 1.4, ease }}
        style={{ fontSize: "clamp(0.55rem, 1vw, 0.78rem)", color: "rgba(255,255,255,0.72)" }}
      >
        Full Stack · GenAI Developer
      </motion.span>
    </div>
  );
}

// Calculate startWidth/startHeight/startRadius so the initial
// clip-path is a perfect circle of diameter = 55vmin.
const getCircleProps = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const size = Math.min(vw, vh) * 0.55; // 55vmin in px
  return {
    startWidth:  (size / vw) * 100,
    startHeight: (size / vh) * 100,
    startRadius: size / 2,
  };
};

function Hero() {
  const typedElement = useRef(null);
  const progressRef = useRef(0);
  const [portalUnsupported, setPortalUnsupported] = useState(false);
  const [circleProps, setCircleProps] = useState(getCircleProps);

  useEffect(() => {
    const onResize = () => setCircleProps(getCircleProps());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
        title={<HeroTitle />}
        useWindowScroll
        startWidth={circleProps.startWidth}
        startHeight={circleProps.startHeight}
        startRadius={circleProps.startRadius}
        endRadius={0}
        mediaZoom={1.1}
        scrollDistance={1.2}
        holdDistance={0.25}
        smoothing={0.1}
        overlayScrim={0.4}
        enabled
        glow={portalUnsupported}
        onProgress={(p) => {
          progressRef.current = p;
        }}
        backdrop={
          <HeroPortal
            progressRef={progressRef}
            onUnsupported={() => setPortalUnsupported(true)}
          />
        }
        scrollHint={
          <>
            <style>{`
              @keyframes heroDot {
                0%        { transform: translateX(-50%) translateY(0px);  opacity: 1;   }
                65%       { transform: translateX(-50%) translateY(30px); opacity: 0;   }
                66%, 100% { transform: translateX(-50%) translateY(0px);  opacity: 0;   }
              }
              @keyframes heroPulse {
                0%, 100% { opacity: 0.45; }
                50%      { opacity: 1;    }
              }
            `}</style>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                animation: "heroPulse 2.4s ease-in-out infinite",
              }}
            >
              <span
                style={{
                  fontFamily: "'Nippo', sans-serif",
                  fontSize: "0.56rem",
                  fontWeight: 400,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.8)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                }}
              >
                Scroll
              </span>
              <div
                style={{
                  position: "relative",
                  width: "1px",
                  height: "46px",
                  background: "rgba(255,255,255,0.18)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 0 7px rgba(255,255,255,0.5)",
                    animation: "heroDot 1.7s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </>
        }
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
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="
              text-[2rem]
              font-bold
              tracking-tight
              drop-shadow-[0_5px_20px_rgba(0,0,0,0.8)]
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              pb-4
            "
          >
            Prabhjot Singh
          </motion.h1>

          {/* Typed Roles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            className="mt-1 min-h-[45px]"
          >
            <p
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
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.7 }}
            className="mt-1 flex items-center gap-5"
          >
            <Magnetic strength={0.45}>
              <a
                href="https://github.com/pr7bh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
              >
                <img src={githubIcon} alt="" className="w-6" />
              </a>
            </Magnetic>

            <Magnetic strength={0.45}>
              <a
                href="https://www.linkedin.com/in/prabhjot-singh-40301b243/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
              >
                <img src={linkedinIcon} alt="" className="w-6" />
              </a>
            </Magnetic>

            <Magnetic strength={0.45}>
              <a
                href="tel:+917056952556"
                aria-label="Call"
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
              >
                <IconPhone
                  size={23}
                  strokeWidth={1}
                  className="text-white"
                  fill="currentColor"
                />
              </a>
            </Magnetic>
          </motion.div>

          {/* Description directly on image */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.9 }}
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
          </motion.p>

          {/* CV */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 1.1 }}
            className="mt-7"
          >
            <Magnetic strength={0.25}>
            <SpecularButton
              size="lg"
              radius={18}
              tint="rgb(255, 255, 255)"
              tintOpacity={0}
              blur={0}
              textColor="rgb(245, 245, 245)"
              lineColor="rgb(255, 255, 255)"
              baseColor="rgb(82, 82, 82)"
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
            </Magnetic>
          </motion.div>
        </div>
      </ScrollExpand>
    </section>
  );
}

export default Hero;
