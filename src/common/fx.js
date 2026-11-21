/* Shared "wow" effects: warp bursts, the hyperdrive easter egg, haptics
   and the visitor's time-of-day mood. Components subscribe to warps; any
   code can trigger one. */

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Warp ──────────────────────────────────────────────────────────
   intensity 0..1 (nav jumps ~0.45, hyperdrive 1), duration in ms. */
const warpListeners = new Set();

export function onWarp(fn) {
  warpListeners.add(fn);
  return () => warpListeners.delete(fn);
}

export function triggerWarp({ intensity = 0.5, duration = 700 } = {}) {
  if (reduceMotion()) return;
  warpListeners.forEach((fn) => fn({ intensity, duration }));
}

/** Smooth-scroll to a section with a short warp burst. */
export function warpTo(id, { intensity = 0.45 } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  triggerWarp({ intensity, duration: 750 });
  el.scrollIntoView({ behavior: "smooth" });
}

/* ── Haptics (Android; iOS doesn't expose vibration) ─────────────── */
const PATTERNS = {
  button: 8,
  nav: 12,
  launch: [10, 30, 22],
  open: [8, 40, 14],
  close: [14, 30, 8],
  field: 5,
  confirm: [10, 40, 10, 40, 24],
  space: 6,
  boot: [12, 50, 30],
  warp: [20, 40, 30, 40, 60, 40, 90],
  achievement: [15, 60, 15, 60, 40],
};

const coarse = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export function haptic(kind) {
  if (!coarse() || reduceMotion() || typeof navigator.vibrate !== "function") return;
  const pattern = PATTERNS[kind];
  if (pattern) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* blocked without a user gesture */
    }
  }
}

/* ── Time-of-day mood ────────────────────────────────────────────── */
const MOODS = {
  dawn: {
    greeting: "Good morning — early start?",
    warm: "255, 190, 120",
    cool: "160, 230, 255",
    warmBoost: 1.15,
    coolBoost: 1.1,
  },
  day: {
    greeting: "Good afternoon — welcome in.",
    warm: "255, 162, 76",
    cool: "147, 241, 255",
    warmBoost: 1,
    coolBoost: 1.15,
  },
  dusk: {
    greeting: "Good evening — glad you stopped by.",
    warm: "255, 128, 64",
    cool: "180, 160, 255",
    warmBoost: 1.45,
    coolBoost: 0.85,
  },
  night: {
    greeting: "Good evening — burning the midnight oil?",
    warm: "255, 150, 80",
    cool: "110, 200, 255",
    warmBoost: 0.75,
    coolBoost: 1.35,
  },
};

export function getMood(date = new Date()) {
  const h = date.getHours();
  const key = h >= 5 && h < 11 ? "dawn" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 21 ? "dusk" : "night";
  return { key, hour: h, ...MOODS[key] };
}

/* ── Hyperdrive: Konami code ↑↑↓↓←→←→BA ──────────────────────────── */
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function installKonami(onUnlock) {
  let pos = 0;
  const onKey = (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
    if (pos === KONAMI.length) {
      pos = 0;
      onUnlock();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
