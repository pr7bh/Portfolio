import { getLiveSfxGraph, getSfxGraph } from "./ambientAudio";
import { haptic } from "./fx";

/* ──────────────────────────────────────────────────────────────────
   Futuristic interface sounds, synthesised on the fly. They're always
   on — muting the background music doesn't silence them.

   Every click / tap is classified by what it hit:
     button   crisp digital blip          (any other button)
     nav      airy whoosh                 (in-page section links)
     launch   rising zap                  (links that open a new tab)
     open     two-tone power-up           (menus, chat, previews opening)
     close    power-down                  (closing them)
     field    tiny tick                   (inputs, textareas, labels)
     confirm  bright chord                (form submit)
     space    sonar ping tuned to the     (empty space; pitch follows
              music's key                  where you tapped)
   An element can force a sound with data-sfx="open" etc., or opt out
   with data-sfx="none".
   ────────────────────────────────────────────────────────────────── */

const midiToHz = (m) => 440 * 2 ** ((m - 69) / 12);

// A-minor pentatonic, matching the ambient score's key.
const PENTATONIC = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81];

let noiseBuffer = null;
function noise(ctx) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  return src;
}

function envelope(ctx, at, peak, attack, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return g;
}

function tone(g, { type = "sine", from, to, at, attack, decay, peak, glide, dest = "out", space = 0 }) {
  const { ctx } = g;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = from;
  osc.frequency.setValueAtTime(from, at);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, at + (glide ?? attack + decay * 0.6));
  const env = envelope(ctx, at, peak, attack, decay);
  osc.connect(env);
  env.connect(dest === "echo" ? g.echo : g.out);
  if (space) {
    const send = ctx.createGain();
    send.gain.value = space;
    env.connect(send);
    send.connect(g.space);
  }
  osc.start(at);
  osc.stop(at + attack + decay + 0.05);
}

function hiss(g, { at, from, to, q = 2, attack, decay, peak, space = 0 }) {
  const { ctx } = g;
  const src = noise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, at);
  bp.frequency.exponentialRampToValueAtTime(to, at + attack + decay);
  const env = envelope(ctx, at, peak, attack, decay);
  src.connect(bp);
  bp.connect(env);
  env.connect(g.out);
  if (space) {
    const send = ctx.createGain();
    send.gain.value = space;
    env.connect(send);
    send.connect(g.space);
  }
  src.start(at);
  src.stop(at + attack + decay + 0.05);
}

const SOUNDS = {
  button(g, t) {
    tone(g, { type: "square", from: 1500, to: 2400, at: t, attack: 0.004, decay: 0.07, peak: 0.035, glide: 0.04 });
    tone(g, { from: 3200, at: t, attack: 0.002, decay: 0.03, peak: 0.03 });
  },
  nav(g, t) {
    hiss(g, { at: t, from: 500, to: 3800, q: 1.4, attack: 0.06, decay: 0.26, peak: 0.12, space: 0.6 });
    tone(g, { from: 520, to: 780, at: t, attack: 0.02, decay: 0.22, peak: 0.05, space: 0.5 });
  },
  launch(g, t) {
    tone(g, { type: "sawtooth", from: 180, to: 1400, at: t, attack: 0.01, decay: 0.2, peak: 0.04, glide: 0.18 });
    tone(g, { from: 880, to: 1760, at: t + 0.05, attack: 0.01, decay: 0.35, peak: 0.05, space: 0.7 });
    hiss(g, { at: t, from: 800, to: 6000, q: 0.8, attack: 0.02, decay: 0.2, peak: 0.05 });
  },
  open(g, t) {
    tone(g, { type: "triangle", from: 660, at: t, attack: 0.005, decay: 0.14, peak: 0.07, space: 0.4 });
    tone(g, { type: "triangle", from: 990, at: t + 0.06, attack: 0.005, decay: 0.28, peak: 0.07, space: 0.6 });
    hiss(g, { at: t, from: 600, to: 2800, q: 3, attack: 0.05, decay: 0.15, peak: 0.04 });
  },
  close(g, t) {
    tone(g, { type: "triangle", from: 990, at: t, attack: 0.005, decay: 0.12, peak: 0.06, space: 0.3 });
    tone(g, { type: "triangle", from: 587, at: t + 0.06, attack: 0.005, decay: 0.24, peak: 0.06, space: 0.5 });
    hiss(g, { at: t, from: 2600, to: 500, q: 3, attack: 0.04, decay: 0.15, peak: 0.035 });
  },
  field(g, t) {
    tone(g, { from: 2800, at: t, attack: 0.002, decay: 0.035, peak: 0.025 });
  },
  confirm(g, t) {
    [72, 76, 79, 84].forEach((n, i) =>
      tone(g, { type: "triangle", from: midiToHz(n), at: t + i * 0.055, attack: 0.006, decay: 0.45, peak: 0.05, space: 0.6 })
    );
  },
  type(g, t) {
    // Terminal key click: tiny, slightly random so it doesn't buzz.
    const f = 1800 + Math.random() * 900;
    tone(g, { type: "square", from: f, at: t, attack: 0.001, decay: 0.018, peak: 0.012 });
  },
  boot(g, t) {
    hiss(g, { at: t, from: 300, to: 5200, q: 1.1, attack: 0.25, decay: 0.5, peak: 0.08, space: 0.7 });
    tone(g, { type: "sawtooth", from: 110, to: 880, at: t, attack: 0.02, decay: 0.55, peak: 0.03, glide: 0.45 });
    [57, 64, 69, 76].forEach((n, i) =>
      tone(g, { type: "triangle", from: midiToHz(n), at: t + 0.32 + i * 0.07, attack: 0.008, decay: 0.9, peak: 0.045, space: 0.8 })
    );
  },
  warp(g, t) {
    // Hyperdrive: a long rising roar with a bright chord on arrival.
    hiss(g, { at: t, from: 120, to: 7000, q: 0.9, attack: 0.9, decay: 1.3, peak: 0.11, space: 0.8 });
    tone(g, { type: "sawtooth", from: 55, to: 880, at: t, attack: 0.05, decay: 1.6, peak: 0.035, glide: 1.2 });
    tone(g, { type: "sawtooth", from: 82.4, to: 1318, at: t + 0.04, attack: 0.05, decay: 1.6, peak: 0.025, glide: 1.25 });
    [69, 76, 81, 88].forEach((n, i) =>
      tone(g, { type: "triangle", from: midiToHz(n), at: t + 1.15 + i * 0.06, attack: 0.01, decay: 1.4, peak: 0.045, space: 0.9 })
    );
  },
  jump(g, t) {
    // Short warp for nav jumps.
    hiss(g, { at: t, from: 400, to: 4800, q: 1.2, attack: 0.12, decay: 0.35, peak: 0.07, space: 0.6 });
  },
  achievement(g, t) {
    [76, 79, 83, 88].forEach((n, i) =>
      tone(g, { type: "triangle", from: midiToHz(n), at: t + i * 0.07, attack: 0.005, decay: 0.5, peak: 0.05, space: 0.7 })
    );
    tone(g, { from: midiToHz(100), at: t + 0.3, attack: 0.004, decay: 0.8, peak: 0.02, dest: "echo" });
  },
  error(g, t) {
    tone(g, { type: "square", from: 220, at: t, attack: 0.004, decay: 0.09, peak: 0.03 });
    tone(g, { type: "square", from: 165, at: t + 0.1, attack: 0.004, decay: 0.14, peak: 0.03 });
  },
  space(g, t, { x = 0.5, y = 0.5 } = {}) {
    const idx = Math.min(PENTATONIC.length - 1, Math.floor(x * PENTATONIC.length));
    const note = PENTATONIC[idx] + (y < 0.4 ? 12 : 0);
    const hz = midiToHz(note);
    tone(g, { from: hz, at: t, attack: 0.004, decay: 1.1, peak: 0.07, space: 0.9 });
    tone(g, { from: hz, at: t, attack: 0.004, decay: 0.6, peak: 0.025, dest: "echo" });
    tone(g, { type: "triangle", from: hz * 2, to: hz * 2.01, at: t, attack: 0.002, decay: 0.25, peak: 0.02 });
  },
};

const INTERACTIVE =
  "a[href], button, [role='button'], [role='tab'], [role='menuitem'], summary, label, input, textarea, select, [data-sfx], [data-cursor]";

function classify(target) {
  const el = target.closest?.(INTERACTIVE);
  if (!el) return "space";
  // Music toggle: power-down when muting, power-up when un-muting.
  const toggle = el.closest("[data-sound-toggle]");
  if (toggle) return toggle.getAttribute("aria-pressed") === "false" ? "open" : "close";

  const forced = el.closest("[data-sfx]")?.dataset.sfx;
  if (forced) return forced === "none" ? null : forced;

  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "LABEL") {
    return el.type === "submit" ? "confirm" : "field";
  }
  if (el.type === "submit") return "confirm";

  // Read state *before* the click is handled (capture phase).
  const expanded = el.getAttribute("aria-expanded");
  if (expanded === "false") return "open";
  if (expanded === "true") return "close";

  const label = `${el.getAttribute("aria-label") || ""} ${el.dataset.cursor || ""}`.toLowerCase();
  if (/\bclose\b|dismiss|keep music off/.test(label)) return "close";
  if (/\bopen\b|view|preview/.test(label)) return "open";

  if (tag === "A") {
    const href = el.getAttribute("href") || "";
    if (el.target === "_blank" || /^https?:/.test(href)) return "launch";
    return "nav";
  }
  if (el.closest("nav")) return "nav";
  return "button";
}

let lastAt = -Infinity;

function onClick(e) {
  const g = getSfxGraph();
  if (!g) return;
  const kind = classify(e.target);
  if (!kind || !SOUNDS[kind]) return;

  // One sound per gesture. Wall-clock, not the audio clock: the audio
  // clock stands still while the context is asleep.
  const nowMs = performance.now();
  if (nowMs - lastAt < 35) return;
  lastAt = nowMs;

  haptic(kind);
  if (clickListeners.size) {
    let { clientX: x, clientY: y } = e;
    // Keyboard "clicks" have no position: use the element's centre.
    if (e.detail === 0 && e.target.getBoundingClientRect) {
      const r = e.target.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    clickListeners.forEach((fn) => fn({ kind, x, y }));
  }
  SOUNDS[kind](g, g.ctx.currentTime + 0.01, {
    x: e.clientX / window.innerWidth,
    y: e.clientY / window.innerHeight,
  });
}

/** Play an interface sound from code. `live` only plays if audio is
    already running (use it for sounds that aren't a direct response to a
    click or key press). */
export function playSfx(kind, { live = false, x, y } = {}) {
  if (!live) haptic(kind);
  const g = live ? getLiveSfxGraph() : getSfxGraph();
  if (!g || !SOUNDS[kind]) return;
  SOUNDS[kind](g, g.ctx.currentTime + 0.005, { x, y });
}

/* Particles and the like listen for interface clicks. */
const clickListeners = new Set();
export function onInterfaceClick(fn) {
  clickListeners.add(fn);
  return () => clickListeners.delete(fn);
}

let installed = false;

export function installUISounds() {
  if (installed || typeof window === "undefined") return () => {};
  installed = true;
  window.addEventListener("click", onClick, { capture: true, passive: true });
  return () => {
    installed = false;
    window.removeEventListener("click", onClick, { capture: true });
  };
}
