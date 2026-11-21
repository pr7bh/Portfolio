import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { pause } from "./ambientAudio";
import { playSfx } from "./uiSounds";
import { EXPERIENCE, PROJECTS, SKILLS } from "./profile";
import { useMediaQuery } from "./hooks";
import LogoMark from "./LogoMark";

const ease = [0.22, 1, 0.36, 1];
const CHAR_MS = 16;
const LINE_GAP_MS = 140;

function soundIsOn() {
  try {
    return localStorage.getItem("ambient-sound") !== "off";
  } catch {
    return true;
  }
}

/* First-visit intro: a short terminal boot sequence. Any key or tap
   enters the site, and that same gesture is what lets the browser start
   the music. "Enter muted" (or M) goes in silently. */
export default function BootScreen({ onEnter }) {
  const reduce = useReducedMotion();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const skillCount = Object.values(SKILLS).flat().length;

  const lines = useMemo(
    () => [
      { label: "initialising prabhjot.sys", value: "v26.11" },
      { label: "mounting /experience", value: `${EXPERIENCE.length} roles · 2+ yrs` },
      { label: "linking /projects", value: `${PROJECTS.length} builds` },
      { label: "compiling /skills", value: `${skillCount} modules` },
      { label: "waking genai core", value: "gemini · rag" },
      { label: "tuning ambient score", value: soundIsOn() ? "a minor" : "muted" },
      { label: "rendering interface", value: "webgl" },
    ],
    [skillCount]
  );

  // Progress through the script: which line, how many characters of it.
  const [line, setLine] = useState(reduce ? lines.length : 0);
  const [chars, setChars] = useState(0);
  const done = line >= lines.length;
  const leaving = useRef(false);
  const enterRef = useRef(null);

  useEffect(() => {
    if (done) return undefined;
    const target = lines[line].label.length;
    if (chars < target) {
      const id = window.setTimeout(() => {
        setChars((c) => c + 1);
        if (chars % 2 === 0) playSfx("type", { live: true });
      }, CHAR_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      setLine((l) => l + 1);
      setChars(0);
    }, LINE_GAP_MS);
    return () => window.clearTimeout(id);
  }, [line, chars, done, lines]);

  useEffect(() => {
    if (done) enterRef.current?.focus({ preventScroll: true });
  }, [done]);

  const enter = ({ muted = false, sound = true } = {}) => {
    if (leaving.current) return;
    leaving.current = true;
    if (muted) pause();
    else if (sound) playSfx("boot");
    onEnter();
  };

  // Any key enters; M enters muted. Clicks/taps are handled on the screen
  // (their sound comes from the global click sounds via data-sfx="boot").
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Tab" || e.key === "Shift") return;
      e.preventDefault();
      if (e.key === "m" || e.key === "M") enter({ muted: true });
      else enter({ sound: e.key !== "Escape" });
    };
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typed = Math.min(line, lines.length);
  const progress = done ? 1 : (line + chars / lines[line].label.length) / lines.length;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      data-boot-screen
      data-sfx="boot"
      onClick={() => enter({ sound: false })}
      initial={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease }}
      className="fixed inset-0 z-99999 flex flex-col overflow-hidden bg-(--ink) text-white select-none"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* Scanlines, grid and glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px circle at 50% 45%, rgba(147,241,255,0.08), transparent 60%), radial-gradient(500px circle at 70% 80%, rgba(255,162,76,0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="boot-scanlines pointer-events-none absolute inset-0"
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-5 text-[0.62rem] uppercase tracking-[0.24em] text-white/55 md:px-10 md:pt-8">
        <span className="flex items-center gap-3">
          <LogoMark size={26} animated />
          <span>{"//"} system boot</span>
        </span>
        <button
          type="button"
          data-sfx="boot"
          onClick={(e) => {
            e.stopPropagation();
            enter({ sound: false });
          }}
          className="rounded-full border border-white/15 px-3.5 py-1.5 text-white/60 transition-colors hover:border-white/40 hover:text-white"
        >
          Skip intro ›
        </button>
      </div>

      {/* Log */}
      <div className="relative flex flex-1 items-center justify-center px-5">
        <div className="w-full max-w-[620px]">
          <div
            aria-hidden="true"
            className="mb-8 text-[clamp(1.6rem,6vw,2.6rem)] font-bold leading-none tracking-[-0.03em]"
            style={{ fontFamily: "'Nippo', sans-serif" }}
          >
            PRABHJOT<span className="text-(--warm)">.</span>SYS
          </div>

          <ol className="space-y-2.5 text-[0.72rem] leading-5 md:text-[0.82rem]" aria-live="polite">
            {/* Every line is laid out from the start (hidden until typed),
                so nothing shifts as the log fills in. */}
            {lines.map((l, i) => {
              const complete = i < typed;
              const current = i === typed;
              const text = complete ? l.label : current ? l.label.slice(0, chars) : l.label;
              return (
                <li
                  key={l.label}
                  className="flex items-baseline gap-3"
                  style={{ visibility: complete || current ? "visible" : "hidden" }}
                  aria-hidden={!complete || undefined}
                >
                  <span className="text-(--cool)/70">&gt;</span>
                  <span className={complete ? "text-white/80" : "text-white"}>
                    {text}
                    {current && <span className="boot-caret" aria-hidden="true" />}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mb-1 min-w-4 flex-1 border-b border-dotted border-white/15"
                  />
                  {complete && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-baseline gap-3 whitespace-nowrap"
                    >
                      <span className="hidden text-white/55 sm:inline">{l.value}</span>
                      <span className="text-emerald-300">[ OK ]</span>
                    </motion.span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Progress */}
          <div className="mt-10 flex items-center gap-4 text-[0.62rem] tracking-[0.2em] text-white/55">
            <div className="relative h-px flex-1 overflow-hidden bg-white/10">
              <div
                className="absolute inset-y-0 left-0 transition-[width] duration-150 ease-linear"
                style={{
                  width: `${progress * 100}%`,
                  background: "linear-gradient(90deg, var(--cool), #fff, var(--warm))",
                  boxShadow: "0 0 12px rgba(147,241,255,0.7)",
                }}
              />
            </div>
            <span className="w-10 text-right tabular-nums">{Math.round(progress * 100)}%</span>
          </div>

          {/* Prompt */}
          <div className="mt-10 flex min-h-[7.5rem] flex-col items-start gap-4">
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="flex w-full flex-col items-start gap-5"
              >
                <span className="text-[0.72rem] text-emerald-300/90 md:text-[0.82rem]">
                  &gt; all systems nominal_
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    ref={enterRef}
                    type="button"
                    data-sfx="boot"
                    onClick={(e) => {
                      e.stopPropagation();
                      enter({ sound: false });
                    }}
                    className="boot-enter group relative overflow-hidden rounded-full border border-white/25 bg-white/[0.06] px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-white transition-colors hover:border-white/60 hover:bg-white/[0.1]"
                  >
                    <span className="relative z-10">
                      {canHover ? "Press any key to enter" : "Tap to enter"}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-sound-toggle
                    onClick={(e) => {
                      e.stopPropagation();
                      enter({ muted: true });
                    }}
                    className="rounded-full px-4 py-3 text-[0.62rem] uppercase tracking-[0.24em] text-white/60 transition-colors hover:text-white"
                  >
                    Enter muted{canHover && <span className="text-white/45"> [M]</span>}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-5 text-[0.58rem] uppercase tracking-[0.24em] text-white/50 md:px-10 md:pb-8">
        Best with sound on
      </div>
    </motion.div>
  );
}
