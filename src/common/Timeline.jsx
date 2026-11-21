import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Tilt } from "./Interactive";

const ease = [0.22, 1, 0.36, 1];

function Spine({ targetRef }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start center", "end center"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  const top = useTransform(progress, (v) => `${v * 100}%`);
  const headOpacity = useTransform(scrollYProgress, [0, 0.015, 0.985, 1], [0, 1, 1, 0]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 top-0 w-px md:left-1/2 md:-translate-x-1/2"
    >
      <div className="absolute inset-0 bg-white/10" />
      <motion.div
        className="absolute inset-0 origin-top"
        style={{
          scaleY: progress,
          background: "linear-gradient(to bottom, var(--cool), rgba(255,255,255,0.9) 50%, var(--warm))",
        }}
      />
      <motion.div className="absolute left-1/2" style={{ top, opacity: headOpacity }}>
        <div className="absolute left-0 top-0 h-28 w-0.5 -translate-x-1/2 -translate-y-full bg-linear-to-t from-white to-transparent blur-[1px]" />
        <div className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-xl" />
        <div className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.85),0_0_28px_8px_rgba(255,162,76,0.35)]" />
      </motion.div>
    </div>
  );
}

// Lights up once the comet (pinned to the viewport centre) has passed it.
function Node({ index }) {
  return (
    <motion.span
      className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-[#050506] font-mono text-[0.6rem] tracking-wider"
      initial="off"
      whileInView="on"
      viewport={{ margin: "100000px 0px -50% 0px" }}
      variants={{
        off: { borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.45)", boxShadow: "0 0 0px rgba(255,162,76,0)" },
        on: {
          borderColor: "rgba(255,162,76,0.9)",
          color: "rgba(255,255,255,1)",
          boxShadow: "0 0 24px rgba(255,162,76,0.45)",
          transition: { duration: 0.5 },
        },
      }}
    >
      {String(index + 1).padStart(2, "0")}
    </motion.span>
  );
}

/** Counts up to a number like "25%", "E1" or "86.3%" when it scrolls into view. */
export function CountUp({ value, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const match = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/.exec(String(value));
  const [shown, setShown] = useState(match && !reduce ? `${match[1]}0${match[3]}` : String(value));

  useEffect(() => {
    if (!match || !inView || reduce) return undefined;
    const [, pre, num, post] = match;
    const decimals = (num.split(".")[1] || "").length;
    const controls = animate(0, parseFloat(num), {
      duration: 1.4,
      ease,
      onUpdate: (v) => setShown(`${pre}${v.toFixed(decimals)}${post}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown}
    </span>
  );
}

function Entry({ item, index, renderContent, renderAside }) {
  const ref = useRef(null);
  const isLeft = index % 2 === 0;
  // Active while the entry crosses the middle of the viewport.
  const active = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const asideY = useTransform(scrollYProgress, [0, 1], [28, -28]);

  return (
    <article
      ref={ref}
      className="relative grid w-full grid-cols-1 md:grid-cols-[1fr_96px_1fr] md:items-start"
    >
      {/* Main card */}
      <div className={`pl-10 md:pl-0 ${isLeft ? "md:col-start-1" : "md:col-start-3"}`}>
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 18 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.1, ease }}
          style={{ transformPerspective: 1200, transformOrigin: "50% 100%" }}
          className={`relative max-w-xl ${isLeft ? "md:ml-auto" : "md:mr-auto"}`}
        >
          <Tilt
            max={3}
            className={`timeline-card rounded-3xl border p-6 transition-[border-color,background-color,box-shadow] duration-700 md:p-8 ${
              active
                ? "border-[rgba(255,162,76,0.32)] bg-white/[0.035] shadow-[0_0_70px_-24px_rgba(255,162,76,0.35)]"
                : "border-white/[0.08] bg-white/[0.015]"
            }`}
          >
            {renderContent(item)}
          </Tilt>
        </motion.div>
      </div>

      {/* Node on the spine */}
      <div className="pointer-events-none relative hidden md:col-start-2 md:row-start-1 md:flex md:justify-center md:pt-7">
        <Node index={index} />
      </div>
      <div className="absolute left-0 top-6 z-20 -translate-x-1/2 md:hidden">
        <Node index={index} />
      </div>

      {/* Connector from the node to the facts panel (desktop) */}
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute top-[44px] hidden h-px w-[56px] md:block ${
          isLeft ? "left-[calc(50%+18px)] origin-left" : "right-[calc(50%+18px)] origin-right"
        }`}
        style={{ background: isLeft ? "linear-gradient(90deg, var(--warm), transparent)" : "linear-gradient(270deg, var(--warm), transparent)" }}
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, ease }}
      />

      {/* Facts panel: dates, numbers, stack */}
      <motion.div
        style={{ y: asideY }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease, delay: 0.15 }}
        className={`relative z-10 mt-6 pl-10 md:row-start-1 md:mt-3 md:pl-0 ${
          isLeft ? "md:col-start-3 md:pl-6" : "md:col-start-1 md:pr-6 md:text-right"
        }`}
      >
        <div className={`max-w-sm ${isLeft ? "" : "md:ml-auto"}`}>{renderAside(item, { isLeft, active })}</div>
      </motion.div>
    </article>
  );
}

function Timeline({ items, getKey, renderContent, renderAside }) {
  const ref = useRef(null);

  return (
    <div ref={ref} className="relative w-full max-w-6xl">
      <Spine targetRef={ref} />
      <div className="relative flex flex-col gap-16 md:gap-36">
        {items.map((item, index) => (
          <Entry
            key={getKey(item)}
            item={item}
            index={index}
            renderContent={renderContent}
            renderAside={renderAside}
          />
        ))}
      </div>
    </div>
  );
}

export default Timeline;
