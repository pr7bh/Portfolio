import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import SignalPanel from "./SignalPanel";
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
function Node() {
  return (
    <motion.span
      className="relative flex h-5 w-5 items-center justify-center rounded-full border bg-[#050506]"
      initial="off"
      whileInView="on"
      viewport={{ margin: "100000px 0px -50% 0px" }}
      variants={{
        off: { borderColor: "rgba(255,255,255,0.25)", boxShadow: "0 0 0px rgba(255,162,76,0)" },
        on: {
          borderColor: "rgba(255,162,76,0.9)",
          boxShadow: "0 0 22px rgba(255,162,76,0.45)",
          transition: { duration: 0.5 },
        },
      }}
    >
      <motion.span
        className="block h-2 w-2 rounded-full bg-white"
        variants={{ off: { scale: 0.6, opacity: 0.4 }, on: { scale: 1, opacity: 1 } }}
      />
    </motion.span>
  );
}

function Entry({ item, index, renderContent, details }) {
  const ref = useRef(null);
  const isLeft = index % 2 === 0;
  // Active while the entry crosses the middle of the viewport.
  const active = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const panelY = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <article
      ref={ref}
      className="relative grid w-full grid-cols-1 md:grid-cols-[1fr_80px_1fr] md:items-start"
    >
      <div
        className={`pl-8 ${
          isLeft ? "md:col-start-1 md:pr-6 md:pl-0 md:text-right" : "md:col-start-3 md:pl-6 md:text-left"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 70, rotateX: 22 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.1, ease }}
          style={{ transformPerspective: 1200, transformOrigin: "50% 100%" }}
          className={`relative mx-auto max-w-xl ${isLeft ? "md:mr-0 md:ml-auto" : "md:ml-0 md:mr-auto"}`}
        >
          <motion.span
            aria-hidden="true"
            className={`pointer-events-none absolute -top-14 select-none font-bold leading-none md:-top-20 ${
              isLeft ? "right-2 md:right-4" : "right-2 md:left-4 md:right-auto"
            }`}
            style={{
              y: ghostY,
              fontSize: "clamp(5rem, 11vw, 10rem)",
              letterSpacing: "-0.06em",
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.09)",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </motion.span>

          <Tilt
            max={4}
            className={`rounded-3xl border p-5 transition-[border-color,background-color,box-shadow] duration-700 md:p-8 ${
              active
                ? "border-[rgba(255,162,76,0.24)] bg-white/[0.025] shadow-[0_0_60px_-20px_rgba(255,162,76,0.25)]"
                : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.015]"
            }`}
          >
            {renderContent(item, isLeft)}
          </Tilt>
        </motion.div>
      </div>

      <div className="pointer-events-none relative hidden md:col-start-2 md:row-start-1 md:flex md:justify-center md:pt-9">
        <Node />
      </div>

      <div className="absolute left-0 top-6 z-20 -translate-x-1/2 md:hidden">
        <Node />
      </div>

      {/* Signal from the timeline node to its panel (desktop) */}
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute top-[46px] hidden h-px w-[70px] md:block ${
          isLeft ? "left-[calc(50%+10px)] origin-left" : "right-[calc(50%+10px)] origin-right"
        }`}
        style={{ background: "linear-gradient(90deg, var(--warm), var(--cool))" }}
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, ease }}
      />

      <motion.div
        style={{ y: panelY }}
        className={`relative z-10 mt-10 flex justify-center pl-8 md:row-start-1 md:mt-4 md:pl-0 ${
          isLeft ? "md:col-start-3 md:justify-start md:pl-10" : "md:col-start-1 md:justify-end md:pr-10"
        }`}
      >
        <SignalPanel rows={details(item)} index={index} active={active} />
      </motion.div>
    </article>
  );
}

function Timeline({ items, getKey, renderContent, details }) {
  const ref = useRef(null);

  return (
    <div ref={ref} className="relative w-full max-w-6xl">
      <Spine targetRef={ref} />
      <div className="relative flex flex-col gap-28 md:gap-40">
        {items.map((item, index) => (
          <Entry
            key={getKey(item)}
            item={item}
            index={index}
            renderContent={renderContent}
            details={details}
          />
        ))}
      </div>
    </div>
  );
}

export default Timeline;
