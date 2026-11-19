import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1];
const NOISE = "▪▫/\\|—01<>+:";

// Resolves text left-to-right out of noise, writing to the DOM directly so
// the animation never re-renders React.
function Decode({ text, play, delay = 0 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !play || reduce) return;
    let raf = 0;
    let start = 0;
    const duration = 650 + text.length * 14;

    const frame = (now) => {
      if (!start) start = now + delay;
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const shown = Math.floor(t * text.length);
      let out = text.slice(0, shown);
      for (let i = shown; i < text.length; i++) {
        out += text[i] === " " ? " " : NOISE[(Math.random() * NOISE.length) | 0];
      }
      el.textContent = out;
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [text, play, delay, reduce]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </>
  );
}

function Corner({ className }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`absolute h-3.5 w-3.5 border-(--warm) ${className}`}
      variants={{ hidden: { opacity: 0, scale: 0.4 }, shown: { opacity: 0.9, scale: 1, transition: { duration: 0.6, ease } } }}
    />
  );
}

function SignalPanel({ rows, index, active }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "shown" : "hidden"}
      className="relative w-full max-w-[320px]"
    >
      <Corner className="-left-1.5 -top-1.5 border-l border-t" />
      <Corner className="-right-1.5 -top-1.5 border-r border-t" />
      <Corner className="-bottom-1.5 -left-1.5 border-b border-l" />
      <Corner className="-bottom-1.5 -right-1.5 border-b border-r" />

      <motion.div
        className="relative overflow-hidden rounded-2xl border bg-[#07080a]/80 px-5 pb-5 pt-4 transition-[border-color,box-shadow] duration-700"
        style={{
          borderColor: active ? "rgba(147,241,255,0.22)" : "rgba(255,255,255,0.07)",
          boxShadow: active ? "0 0 50px -18px rgba(147,241,255,0.35)" : "none",
        }}
        variants={{
          hidden: { opacity: 0, clipPath: "inset(0 0 100% 0 round 16px)" },
          shown: { opacity: 1, clipPath: "inset(0 0 0% 0 round 16px)", transition: { duration: 0.9, ease } },
        }}
      >
        {/* Scan line sweeping down as the record resolves */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(147,241,255,0.12), transparent)" }}
          variants={{
            hidden: { y: "-100%", opacity: 0 },
            shown: { y: ["-100%", "520%"], opacity: [0, 1, 0], transition: { duration: 1.6, ease: "easeInOut", delay: 0.2 } },
          }}
        />

        <div className="meta flex items-center justify-between text-white/40">
          <span className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inset-0 rounded-full bg-(--cool) ${active ? "animate-ping opacity-60" : "opacity-0"}`}
              />
              <span className="relative h-1.5 w-1.5 rounded-full bg-(--cool)" />
            </span>
            Signal
          </span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>

        <motion.span
          aria-hidden="true"
          className="mt-4 block h-px origin-left"
          style={{ background: "linear-gradient(90deg, var(--cool), rgba(255,255,255,0.15) 60%, transparent)" }}
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.9, ease, delay: 0.3 } } }}
        />

        <dl className="mt-4 space-y-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.4 + i * 0.14 } },
              }}
            >
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-white/35" style={{ fontFamily: "var(--font-mono)" }}>
                {row.label}
              </dt>
              <dd className="mt-1 text-[0.95rem] font-medium leading-snug text-white/90">
                <Decode text={row.value} play={inView} delay={450 + i * 140} />
              </dd>
            </motion.div>
          ))}
        </dl>
      </motion.div>
    </motion.div>
  );
}

export default SignalPanel;
