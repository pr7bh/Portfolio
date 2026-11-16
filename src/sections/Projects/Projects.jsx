import { useEffect, useRef, useState } from "react";
import FlexCarousel from "../../common/FlexCarousel";
import styles from "./ProjectsStyles.module.css";
import { motion } from "motion/react";

import geomind from "../../assets/geomind.png";
import syncora from "../../assets/syncora.png";
import realEstate from "../../assets/real-estate.jpg";
import netflix from "../../assets/netflix.jpg";
import cryptoverse from "../../assets/cryptoverse.jpg";
import shoppingCart from "../../assets/shopping-cart.jpg";

function Projects() {
  const projectsRef = useRef(null);
  const wheelCountRef = useRef(0);
  const scrollContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const activeSlideRef = useRef(0);

  const [isInView, setIsInView] = useState(false);
  const [captureWheel, setCaptureWheel] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches
  );
  const [activeSlide, setActiveSlide] = useState(0);

  const MAX_WHEEL_SCROLLS = 25;

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wheelCountRef.current = 0;
          setCaptureWheel(true);
          setIsInView(true);
        } else {
          setIsInView(false);
          setCaptureWheel(false);
          wheelCountRef.current = 0;
        }
      },
      { threshold: 0.35 }
    );
    if (projectsRef.current) observer.observe(projectsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !captureWheel) return;
    const handleWheel = () => {
      wheelCountRef.current += 1;
      if (wheelCountRef.current >= MAX_WHEEL_SCROLLS) setCaptureWheel(false);
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isInView, captureWheel]);

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
    cardRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [isDesktop]);

  // Keep a ref in sync so the autoplay interval never reads a stale slide index
  useEffect(() => { activeSlideRef.current = activeSlide; }, [activeSlide]);

  // Autoplay — advance every 3.5 s, pause while user is touching
  useEffect(() => {
    if (isDesktop) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let paused = false;

    const advance = () => {
      if (paused) return;
      const next = (activeSlideRef.current + 1) % items.length;
      scrollToCard(next);
    };

    const interval = setInterval(advance, 3500);
    const pause  = () => { paused = true; };
    const resume = () => { setTimeout(() => { paused = false; }, 1200); };

    container.addEventListener("touchstart", pause,  { passive: true });
    container.addEventListener("touchend",   resume, { passive: true });

    return () => {
      clearInterval(interval);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend",   resume);
    };
  }, [isDesktop]);

  const scrollToCard = (index) => {
    const container = scrollContainerRef.current;
    const card = cardRefs.current[index];
    if (!container || !card) return;
    container.scrollTo({
      left: card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  const items = [
    {
      src: geomind,
      alt: "GeoMind AI geospatial intelligence platform",
      title: "GeoMind AI",
      subtitle: "Geospatial AI platform • LLM • Maps",
      link: "https://geo-mind-by-prabh.vercel.app/",
    },
    {
      src: syncora,
      alt: "Syncora GenAI application",
      title: "Syncora",
      subtitle: "GenAI meeting assistant • RAG • Gemini",
      link: "https://syncora-by-prabh.vercel.app/",
    },
    {
      src: realEstate,
      alt: "Real Estate Finder",
      title: "Real Estate",
      subtitle: "Property discovery and search platform",
      link: "https://singh-estate.vercel.app/",
    },
    {
      src: netflix,
      alt: "Netflix Clone",
      title: "Netflix Clone",
      subtitle: "Streaming platform UI",
      link: "https://netflix-by-prabh.vercel.app/",
    },
    {
      src: cryptoverse,
      alt: "Cryptoverse cryptocurrency application",
      title: "Cryptoverse",
      subtitle: "Cryptocurrency tracking application",
      link: "https://cryptoverse7.vercel.app/",
    },
    {
      src: shoppingCart,
      alt: "Shopping Cart application",
      title: "Shopping Cart",
      subtitle: "E-commerce shopping application",
      link: "https://shop-by-prabh.vercel.app/",
    },
  ];

  const handleSelect = (_, item) => {
    if (item?.link && item.link !== "#") {
      window.open(item.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      ref={projectsRef}
      id="projects"
      className="m-0 flex w-screen max-w-none flex-col items-center gap-6 p-0 pt-25"
    >
      <motion.h2
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sectionTitle"
      >
        Projects
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        className="text-sm tracking-wide opacity-50"
      >
        Click any card to visit the project ↗
      </motion.p>

      {isDesktop ? (
        /* Desktop — WebGL FlexCarousel, never mounted on mobile/tablet */
        <div className="relative m-0 h-175 min-h-100 w-screen max-w-none overflow-hidden p-0">
          {carouselReady && (
            <FlexCarousel
              items={items}
              preset="liquid"
              intro="rise"
              cardHeight={0.5}
              gap={12}
              squeeze={0.2}
              focusOnClick
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
              captureWheel={captureWheel}
              onSelect={handleSelect}
              className="relative m-0 h-full w-full p-0"
            />
          )}
        </div>
      ) : (
        /* Mobile / tablet — scroll-snap card carousel */
        <div className={styles.mobileWrapper}>
          <div ref={scrollContainerRef} className={styles.scrollTrack}>
            {items.map((item, index) => {
              const hasLink = item.link && item.link !== "#";
              const isActive = index === activeSlide;
              return (
                <div
                  key={index}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className={[
                    styles.card,
                    isActive ? styles.cardActive : styles.cardInactive,
                    hasLink ? styles.cardClickable : "",
                  ].join(" ")}
                  onClick={() => {
                    if (hasLink) {
                      window.open(item.link, "_blank", "noopener,noreferrer");
                    }
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.alt || item.title}
                    className={styles.cardImg}
                    draggable={false}
                  />
                  <div className={styles.cardGradient} />

                  {/* Number badge + Visit link */}
                  <div className={styles.cardTop}>
                    <span className={styles.numBadge}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {hasLink && (
                      <span className={styles.visitBadge}>Visit ↗</span>
                    )}
                  </div>

                  {/* Frosted glass title overlay */}
                  <div className={styles.cardPanel}>
                    {item.subtitle && (
                      <span className={styles.cardSubtitle}>
                        {item.subtitle}
                      </span>
                    )}
                    <span className={styles.cardTitle}>{item.title}</span>
                    <hr className={styles.cardRule} />
                    <div className={styles.cardMeta}>
                      <span className={styles.cardCount}>
                        {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                      </span>
                      {hasLink && (
                        <span className={styles.cardArrow}>→</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.dots}>
            {items.map((_, index) => (
              <div
                key={index}
                className={
                  index === activeSlide ? styles.dotActive : styles.dot
                }
                onClick={() => scrollToCard(index)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Projects;
