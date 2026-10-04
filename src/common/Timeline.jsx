"use client";

import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeight(ref.current.getBoundingClientRect().height);
      }
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  const heightTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [0, height]
  );

  const opacityTransform = useTransform(
    scrollYProgress,
    [0, 0.1],
    [0, 1]
  );

  return (
    <div
      ref={containerRef}
      className="w-full font-sans"
    >
      {/* Timeline heading */}
      <div className="mx-auto max-w-5xl px-5 pb-10 pt-4 md:px-10">
        <h2 className="text-2xl font-bold text-black dark:text-white md:text-4xl">
          Education Journey
        </h2>

        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 md:text-base">
          My academic journey and achievements.
        </p>
      </div>

      {/* Timeline */}
      <div
        ref={ref}
        className="relative mx-auto max-w-5xl px-5 pb-20 md:px-10"
      >
        {data.map((item, index) => (
          <div
            key={index}
            className="relative flex gap-6 pb-16 last:pb-0 md:gap-10"
          >
            {/* Left side - Year */}
            <div className="relative w-[90px] shrink-0 md:w-[180px]">
              <div className="sticky top-32">
                <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 md:text-xl">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative flex w-6 shrink-0 justify-center">
              {/* Dot */}
              <div
                className="
                  relative z-20
                  mt-1
                  h-4 w-4
                  rounded-full
                  border-2
                  border-neutral-400
                  bg-neutral-900
                  dark:border-neutral-500
                  dark:bg-black
                "
              />

              {/* Vertical line */}
              {index !== data.length - 1 && (
                <div
                  className="
                    absolute
                    top-5
                    h-[calc(100%+4rem)]
                    w-[2px]
                    bg-neutral-200
                    dark:bg-neutral-800
                  "
                />
              )}
            </div>

            {/* Education card */}
            <div className="min-w-0 flex-1">
              {item.content}
            </div>
          </div>
        ))}

        {/* Animated progress line */}
        <div
          className="
            absolute
            left-[calc(5px+90px+1.5rem)]
            top-0
            hidden
            w-[2px]
            overflow-hidden
            bg-transparent
            md:block
          "
          style={{
            height: `${height}px`,
          }}
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="
              absolute
              left-0
              top-0
              w-[2px]
              rounded-full
              bg-gradient-to-b
              from-purple-500
              via-blue-500
              to-cyan-400
            "
          />
        </div>
      </div>
    </div>
  );
};