import githubLight from "../../assets/github-light.svg";
import githubDark from "../../assets/github-dark.svg";
import linkedinLight from "../../assets/linkedin-light.svg";
import linkedinDark from "../../assets/linkedin-dark.svg";
import CV from "../../assets/cv.pdf";
import heroImage from "../../assets/hero.webp";
import SpecularButton from "../../common/SpecularButton";

import { useTheme } from "../../common/ThemeContext";
import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import ScrollExpand from "../../common/ScrollExpand";
import HeroPortal from "../../common/HeroPortal";
import { Magnetic } from "../../common/Interactive";
import { useMediaQuery } from "../../common/hooks";
import { IconPhone } from "@tabler/icons-react";
import { motion } from "motion/react";
import { AvailabilityBadge } from "../../common/Availability";
import ScrollCue from "../../common/ScrollCue";
import { getMood } from "../../common/fx";
import { useIntroReady } from "../../common/introGate";

const ease = [0.22, 1, 0.36, 1];

const greeting = getMood().greeting;

function HeroTitle() {
  const ready = useIntroReady();
  let n = 0;
  return (
    <div className="flex flex-col items-center gap-[0.4em]">
      {/* Greeting for the visitor's local time of day */}
      <motion.span
        className="meta mb-[0.6em]"
        initial={{ opacity: 0, y: -8 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 1, delay: 0.35, ease }}
        style={{ fontSize: "clamp(0.55rem, 0.9vw, 0.7rem)", color: "rgba(255,255,255,0.75)", letterSpacing: "0.28em" }}
      >
        {greeting}
      </motion.span>
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
                  animate={{ y: ready ? "0%" : "110%" }}
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
        // Fade/blur instead of animating letter-spacing, which moves layout.
        initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 8, filter: "blur(6px)" }}
        transition={{ duration: 1.4, delay: 1.4, ease }}
        style={{ fontSize: "clamp(0.55rem, 1vw, 0.78rem)", color: "rgba(255,255,255,0.72)", letterSpacing: "0.32em" }}
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

// Where the face sits in hero.webp (fractions of width / height).
const FACE_FOCUS = { x: 0.487, y: 0.44 };

function Hero() {
  const isMobile = useMediaQuery("(max-width: 767px)");
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
        mediaZoom={isMobile ? 0.82 : 1.12}
        mediaFocus={FACE_FOCUS}
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
        scrollHint={<ScrollCue />}
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mb-5"
          >
            <AvailabilityBadge />
          </motion.div>

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
