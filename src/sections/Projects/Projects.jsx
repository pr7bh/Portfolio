import { useCallback, useEffect, useRef, useState } from "react";
import { IconExternalLink } from "@tabler/icons-react";
import { motion } from "motion/react";
import FlexCarousel from "../../common/FlexCarousel";
import SectionHeading from "../../common/SectionHeading";
import { useMediaQuery } from "../../common/hooks";
import ProjectPreview from "./ProjectPreview";
import Holo from "../../common/Holo";
import GitHubPulse from "./GitHubPulse";
import styles from "./ProjectsStyles.module.css";

import geomind from "../../assets/geomind.webp";
import syncora from "../../assets/syncora.webp";
import realEstate from "../../assets/real-estate.webp";
import netflix from "../../assets/netflix.webp";
import cryptoverse from "../../assets/cryptoverse.webp";
import shoppingCart from "../../assets/shopping-cart.webp";

const items = [
  {
    src: geomind,
    alt: "GeoMind AI geospatial intelligence platform",
    title: "GeoMind AI",
    subtitle: "Geospatial AI platform • LLM • Maps",
    link: "https://geo-mind-by-prabh.vercel.app/",
    accent: "#7fd6bd",
  },
  {
    src: syncora,
    alt: "Syncora GenAI application",
    title: "Syncora",
    subtitle: "GenAI meeting assistant • RAG • Gemini",
    link: "https://syncora-by-prabh.vercel.app/",
    accent: "#a9b8ff",
  },
  {
    src: realEstate,
    alt: "Real Estate Finder",
    title: "Real Estate",
    subtitle: "Property discovery and search platform",
    link: "https://singh-estate.vercel.app/",
    accent: "#e6c39b",
  },
  {
    src: netflix,
    alt: "Netflix Clone",
    title: "Netflix Clone",
    subtitle: "Streaming platform UI",
    link: "https://netflix-by-prabh.vercel.app/",
    accent: "#ff3b3b",
  },
  {
    src: cryptoverse,
    alt: "Cryptoverse cryptocurrency application",
    title: "Cryptoverse",
    subtitle: "Cryptocurrency tracking application",
    link: "https://cryptoverse7.vercel.app/",
    accent: "#f5b84c",
  },
  {
    src: shoppingCart,
    alt: "Shopping Cart application",
    title: "Shopping Cart",
    subtitle: "E-commerce shopping application",
    link: "https://shop-by-prabh.vercel.app/",
    accent: "#ff8f6b",
  },
];

const pad = (n) => String(n).padStart(2, "0");

function Projects() {
  const projectsRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const activeSlideRef = useRef(0);
  const previewOpenRef = useRef(false);

  const [carouselReady, setCarouselReady] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [activeSlide, setActiveSlide] = useState(0);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    previewOpenRef.current = preview !== null;
  }, [preview]);

  useEffect(() => {
    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCarouselReady(true);
          mountObserver.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (projectsRef.current) mountObserver.observe(projectsRef.current);
    return () => mountObserver.disconnect();
  }, []);

  // Track which mobile card is centred
  useEffect(() => {
    if (isDesktop) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(entry.target);
            if (index !== -1) setActiveSlide(index);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );
    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isDesktop]);

  // Keep a ref in sync so the autoplay interval never reads a stale slide index
  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  const scrollToCard = useCallback((index) => {
    const container = scrollContainerRef.current;
    const card = cardRefs.current[index];
    if (!container || !card) return;
    container.scrollTo({
      left: card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, []);

  // Autoplay — advance every 3.5 s, pause while touching or previewing
  useEffect(() => {
    if (isDesktop) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let paused = false;
    const advance = () => {
      if (paused || previewOpenRef.current) return;
      scrollToCard((activeSlideRef.current + 1) % items.length);
    };

    const interval = setInterval(advance, 3500);
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      setTimeout(() => {
        paused = false;
      }, 1200);
    };

    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume, { passive: true });

    return () => {
      clearInterval(interval);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, [isDesktop, scrollToCard]);

  const closePreview = useCallback(() => setPreview(null), []);

  return (
    <section
      ref={projectsRef}
      id="projects"
      className="m-0 flex w-full max-w-none flex-col items-center overflow-x-clip p-0 pt-24"
    >
      <SectionHeading index="02" kicker="Selected work" title="Projects" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="meta -mt-8 flex items-center gap-2 px-5 text-center text-white/45 md:-mt-14"
      >
        {isDesktop
          ? "Drag to browse · click the centred project for its case study"
          : "Swipe · tap for the case study"}
        <IconExternalLink size={13} stroke={1.75} aria-hidden="true" />
      </motion.div>

      {isDesktop ? (
        /* Desktop — WebGL FlexCarousel, never mounted on mobile/tablet */
        <div
          className="relative m-0 h-175 min-h-100 w-full max-w-none overflow-hidden p-0"
          data-cursor="view"
          data-cursor-label="View"
          data-cursor-drag="Drag"
        >
          {carouselReady && (
            <FlexCarousel
              items={items}
              preset="liquid"
              intro="rise"
              cardHeight={0.5}
              gap={12}
              squeeze={0.2}
              focusOnClick={false}
              captions
              fit="natural"
              radius={0}
              lensWidth={0.74}
              lensHeight={1.18}
              tilt={62}
              roundness={1}
              bend={0.34}
              reach={0.38}
              curl="twist"
              dispersion={0.45}
              liquid={0}
              followCursor={false}
              autoplay={false}
              interval={4}
              captureWheel={false}
              onSelect={(index) => setPreview(index)}
              className="relative m-0 h-full w-full p-0"
            />
          )}
        </div>
      ) : (
        /* Mobile / tablet — scroll-snap card carousel */
        <div className={`${styles.mobileWrapper} mt-8`}>
          <div ref={scrollContainerRef} className={styles.scrollTrack}>
            {items.map((item, index) => {
              const isActive = index === activeSlide;
              return (
                <div
                  key={item.title}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Preview ${item.title}`}
                  className={[
                    styles.card,
                    isActive ? styles.cardActive : styles.cardInactive,
                    styles.cardClickable,
                  ].join(" ")}
                  onClick={() => setPreview(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPreview(index);
                    }
                  }}
                >
                  <Holo className="absolute inset-0" gyro active={isActive} max={8}>
                  <img
                    src={item.src}
                    alt={item.alt || item.title}
                    className={styles.cardImg}
                    draggable={false}
                    loading="lazy"
                  />
                  <div className={styles.cardGradient} />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-8 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
                  />

                  {/* Number badge + Visit link */}
                  <div className={styles.cardTop}>
                    <span className={styles.numBadge}>{pad(index + 1)}</span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${item.title} live site`}
                      className={styles.visitBadge}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <IconExternalLink size={16} stroke={1.75} />
                    </a>
                  </div>

                  {/* Frosted glass title overlay */}
                  <div className={styles.cardPanel}>
                    {item.subtitle && (
                      <span className={styles.cardSubtitle}>{item.subtitle}</span>
                    )}
                    <span className={styles.cardTitle}>{item.title}</span>
                    <hr className={styles.cardRule} />
                    <div className={styles.cardMeta}>
                      <span className={styles.cardCount}>
                        {pad(index + 1)} / {pad(items.length)}
                      </span>
                      <span className={styles.cardArrow} style={{ color: item.accent }}>
                        <IconExternalLink size={15} stroke={1.75} />
                      </span>
                    </div>
                  </div>
                  </Holo>
                </div>
              );
            })}
          </div>

          <div className={styles.dots}>
            {items.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Show ${item.title}`}
                aria-current={index === activeSlide}
                className={index === activeSlide ? styles.dotActive : styles.dot}
                onClick={() => scrollToCard(index)}
              />
            ))}
          </div>
        </div>
      )}

      <GitHubPulse />

      <ProjectPreview items={items} index={preview} onClose={closePreview} onNavigate={setPreview} />
    </section>
  );
}

export default Projects;
