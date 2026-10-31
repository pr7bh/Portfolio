import { useEffect, useRef, useState } from "react";
import FlexCarousel from "../../common/FlexCarousel";

import geomind from "../../assets/geomind.png";
import syncora from "../../assets/syncora.png";
import webgeo from "../../assets/webgeo.jpg";
import capacityMargin from "../../assets/capacity-margin.jpg";
import realEstate from "../../assets/real-estate.jpg";
import netflix from "../../assets/netflix.jpg";
import cryptoverse from "../../assets/cryptoverse.jpg";
import shoppingCart from "../../assets/shopping-cart.jpg";
import snakeGame from "../../assets/snake-game.jpg";

function Projects() {
  const projectsRef = useRef(null);
  const wheelCountRef = useRef(0);

  const [isInView, setIsInView] = useState(false);
  const [captureWheel, setCaptureWheel] = useState(false);
  // Defer mounting WebGL carousel until section is near viewport.
  // Prevents loading 9 images as GPU textures on initial page load,
  // which was crashing Safari on iPhone due to memory pressure.
  const [carouselReady, setCarouselReady] = useState(false);

  const MAX_WHEEL_SCROLLS = 25;

  useEffect(() => {
    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCarouselReady(true);
          mountObserver.disconnect();
        }
      },
      { rootMargin: '200px' }
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
      {
        threshold: 0.35,
      }
    );

    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !captureWheel) return;

    const handleWheel = () => {
      wheelCountRef.current += 1;

      if (wheelCountRef.current >= MAX_WHEEL_SCROLLS) {
        setCaptureWheel(false);
      }
    };

    window.addEventListener("wheel", handleWheel, {
      passive: true,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isInView, captureWheel]);

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
      src: webgeo,
      alt: "WebGeo geospatial mapping platform",
      title: "WebGeo",
      subtitle: "Real-time geospatial platform • HERE Maps",
      link: "#",
    },
    {
      src: capacityMargin,
      alt: "Predicted BA Capacity Margin Map",
      title: "BA Capacity Margin",
      subtitle: "Energy visualization • Forecasting • Maps",
      link: "#",
    },
    {
      src: realEstate,
      alt: "Real Estate Finder",
      title: "Real Estate",
      subtitle: "Property discovery and search platform",
      link: "https://real-estate-a73r.onrender.com/",
    },
    {
      src: netflix,
      alt: "Netflix Clone",
      title: "Netflix Clone",
      subtitle: "Streaming platform UI",
      link: "https://netflix-clone-yc80.onrender.com/",
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
      link: "https://github.com/pr7bh/Shopping_Cart",
    },
    {
      src: snakeGame,
      alt: "Snake Game developed using Java",
      title: "Snake Game",
      subtitle: "Classic game built with Java",
      link: "https://github.com/pr7bh/Snake_Game_JAVA",
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
      className="
        m-0
        flex
        w-screen
        max-w-none
        flex-col
        items-center
        gap-6
        p-0
        pt-25
      "
    >
      <h1 className="sectionTitle">
        Projects
      </h1>

      <div
        className="
          relative
          m-0
          h-175
          min-h-100
          w-screen
          max-w-none
          overflow-hidden
          p-0
        "
      >
        {carouselReady && <FlexCarousel
          items={items}
          preset="liquid"
          intro="rise"

          cardHeight={0.5}
          gap={12}
          squeeze={0.2}

          focusOnClick

          /* Show project title + description */
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

          className="
            relative
            m-0
            h-full
            w-full
            p-0
          "
        />}
      </div>
    </section>
  );
}

export default Projects;