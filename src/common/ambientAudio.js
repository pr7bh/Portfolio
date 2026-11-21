import { useSyncExternalStore } from "react";

/* ──────────────────────────────────────────────────────────────────
   Generative ambient score, synthesised live with the Web Audio API —
   no audio file to download. Slow detuned pads drift through a minor
   progression over a sub drone, while sparse arpeggio "pings" echo
   through a delay and a long reverb.

   One shared engine for the whole page: every toggle reads the same
   state through useAmbientSound().
   ────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "ambient-sound";
const MASTER_LEVEL = 0.42;
const CHORD_SECONDS = 9;
const STEP_SECONDS = 0.375; // arpeggio grid (80 BPM eighths)

// Am(add9) → Fmaj7(#11) → Cmaj7 → Em9, as MIDI notes.
const PROGRESSION = [
  [45, 52, 57, 59, 60, 64],
  [41, 48, 57, 59, 60, 64],
  [48, 55, 59, 62, 64, 67],
  [40, 52, 55, 59, 62, 66],
];

const midiToHz = (m) => 440 * 2 ** ((m - 69) / 12);

let ctx = null;
let master = null;
let bus = null;
let padFilter = null;
let echo = null;
let analyser = null;
let sfxBus = null; // UI sound effects: dry
let sfxSpace = null; // UI sound effects: send into the reverb
let sfxEcho = null; // UI sound effects: their own echo

let playing = false;
let schedulerId = 0;
let nextChordAt = 0;
let nextStepAt = 0;
let chordIndex = 0;
let pendingStartCleanup = null;
let wanted = false; // guards a resume() that resolves after the visitor muted
let armed = false; // waiting for the first gesture to start the music
const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn());

// On unless the visitor has muted it before.
function readPref() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function writePref(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable — preference just isn't remembered */
  }
}

function makeImpulse(seconds, decay) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return buffer;
}

let built = false;

/* The bare context is cheap; the graph (generated reverb and noise
   buffers) is not. Browsers keep audio suspended until the visitor's first
   click, so the graph is only built once sound can actually play, keeping
   that work out of page load. */
function ensureContext() {
  if (ctx) return true;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return false;
  ctx = new AudioCtx();
  return true;
}

function build() {
  if (built) return true;
  if (!ensureContext()) return false;
  built = true;

  master = ctx.createGain();
  master.gain.value = 0;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -16;
  limiter.ratio.value = 6;

  analyser = ctx.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.82;

  master.connect(limiter);
  limiter.connect(analyser);
  analyser.connect(ctx.destination);

  // Music feeds the bus → master. The master (the music's mute fader)
  // goes out dry and into a shared reverb whose output skips the fader,
  // so interface sounds keep their room while the music is muted.
  bus = ctx.createGain();
  bus.connect(master);

  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(5, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.7;
  const reverbLowCut = ctx.createBiquadFilter(); // keep the sub drone out of the room
  reverbLowCut.type = "highpass";
  reverbLowCut.frequency.value = 180;
  master.connect(reverbLowCut);
  reverbLowCut.connect(reverb);
  reverb.connect(wet);
  wet.connect(limiter);

  // Interface sounds: independent of the music, always on.
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.9;
  sfxBus.connect(limiter);
  sfxSpace = ctx.createGain();
  sfxSpace.gain.value = 0.5;
  sfxSpace.connect(reverb);
  sfxEcho = ctx.createDelay(1);
  sfxEcho.delayTime.value = STEP_SECONDS * 2;
  const sfxFeedback = ctx.createGain();
  sfxFeedback.gain.value = 0.35;
  const sfxEchoTone = ctx.createBiquadFilter();
  sfxEchoTone.type = "lowpass";
  sfxEchoTone.frequency.value = 2600;
  sfxEcho.connect(sfxEchoTone);
  sfxEchoTone.connect(sfxFeedback);
  sfxFeedback.connect(sfxEcho);
  sfxEchoTone.connect(sfxBus);

  // Pads breathe through a slowly sweeping low-pass filter.
  padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.8;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.045;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 520;
  lfo.connect(lfoDepth);
  lfoDepth.connect(padFilter.frequency);
  lfo.start();
  padFilter.connect(bus);

  // Ping-pong-ish echo for the arpeggio.
  echo = ctx.createDelay(2);
  echo.delayTime.value = STEP_SECONDS * 2;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.42;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = "lowpass";
  echoTone.frequency.value = 2600;
  echo.connect(echoTone);
  echoTone.connect(feedback);
  feedback.connect(echo);
  echoTone.connect(bus);

  // A faint band of filtered "air" for texture.
  const noise = ctx.createBufferSource();
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  noise.buffer = noiseBuf;
  noise.loop = true;
  const air = ctx.createBiquadFilter();
  air.type = "bandpass";
  air.frequency.value = 1800;
  air.Q.value = 6;
  const airLfo = ctx.createOscillator();
  airLfo.frequency.value = 0.07;
  const airDepth = ctx.createGain();
  airDepth.gain.value = 1100;
  airLfo.connect(airDepth);
  airDepth.connect(air.frequency);
  const airGain = ctx.createGain();
  airGain.gain.value = 0.018;
  noise.connect(air);
  air.connect(airGain);
  airGain.connect(bus);
  noise.start();
  airLfo.start();

  return true;
}

function playChord(notes, at) {
  const attack = 3.5;
  const release = 4.5;
  const end = at + CHORD_SECONDS + release;

  notes.forEach((note, i) => {
    const voice = ctx.createGain();
    const level = 0.05 / (1 + i * 0.12);
    voice.gain.setValueAtTime(0, at);
    voice.gain.linearRampToValueAtTime(level, at + attack);
    voice.gain.setValueAtTime(level, at + CHORD_SECONDS);
    voice.gain.linearRampToValueAtTime(0, end);
    voice.connect(padFilter);

    [-8, 8].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = midiToHz(note);
      osc.detune.value = cents;
      osc.connect(voice);
      osc.start(at);
      osc.stop(end);
    });
  });

  // Sub drone an octave under the root.
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = midiToHz(notes[0] - 12);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0, at);
  subGain.gain.linearRampToValueAtTime(0.16, at + attack);
  subGain.gain.setValueAtTime(0.16, at + CHORD_SECONDS);
  subGain.gain.linearRampToValueAtTime(0, end);
  sub.connect(subGain);
  subGain.connect(master);
  sub.start(at);
  sub.stop(end);
}

function playPing(note, at) {
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = midiToHz(note);
  const shimmer = ctx.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.value = midiToHz(note + 12);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(0.06, at + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);

  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.35;

  osc.connect(env);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(env);
  env.connect(bus);
  env.connect(echo);

  osc.start(at);
  shimmer.start(at);
  osc.stop(at + 1.7);
  shimmer.stop(at + 1.7);
}

// Look-ahead scheduler: queues notes slightly ahead of the audio clock.
function tick() {
  const horizon = ctx.currentTime + 0.4;

  while (nextChordAt < horizon) {
    playChord(PROGRESSION[chordIndex], nextChordAt);
    chordIndex = (chordIndex + 1) % PROGRESSION.length;
    nextChordAt += CHORD_SECONDS;
  }

  while (nextStepAt < horizon) {
    if (Math.random() < 0.3) {
      const chord = PROGRESSION[(chordIndex + PROGRESSION.length - 1) % PROGRESSION.length];
      const tone = chord[1 + Math.floor(Math.random() * (chord.length - 1))];
      playPing(tone + (Math.random() < 0.5 ? 12 : 24), nextStepAt);
    }
    nextStepAt += STEP_SECONDS;
  }
}

function startScheduler() {
  if (schedulerId) return;
  const now = ctx.currentTime + 0.05;
  nextChordAt = Math.max(nextChordAt, now);
  nextStepAt = Math.max(nextStepAt, now + 1.5);
  tick();
  schedulerId = window.setInterval(tick, 120);
}

function stopScheduler() {
  window.clearInterval(schedulerId);
  schedulerId = 0;
}

let suspendTimer = 0;

// While the music is off the context sleeps, waking only for interface
// sounds and dozing off again once they've rung out.
function scheduleIdleSuspend(ms) {
  window.clearTimeout(suspendTimer);
  suspendTimer = window.setTimeout(() => {
    if (playing || !ctx) return;
    ctx.suspend();
  }, ms);
}

// iOS mutes Web Audio when the silent switch is on unless the page
// declares it is playing media (Safari 17+).
function declarePlayback() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
  } catch {
    /* unsupported */
  }
}

export async function play() {
  if (!ensureContext()) return;
  wanted = true;
  window.clearTimeout(suspendTimer);
  declarePlayback();
  // Without a user gesture the browser keeps this pending (autoplay policy).
  await ctx.resume();
  if (!wanted || ctx.state !== "running") return;
  build();
  pendingStartCleanup?.();
  armed = false;
  if (playing) return;
  startScheduler();
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(MASTER_LEVEL, t + 2.5);
  playing = true;
  writePref(true);
  emit();
}

export function pause({ remember = true } = {}) {
  wanted = false;
  armed = false;
  if (remember) writePref(false);
  pendingStartCleanup?.();
  if (!ctx || !playing) {
    playing = false;
    emit();
    return;
  }
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + 0.9);
  playing = false;
  stopScheduler(); // already-queued notes fade out with the master
  emit();
  scheduleIdleSuspend(6000);
}

export function toggle() {
  return playing ? pause() : play();
}

/** Audio graph for interface sounds. They play whether or not the music
    is on; call this from a click/tap handler so the browser lets the
    context wake. Returns null only if Web Audio is unavailable. */
export function getSfxGraph() {
  if (!build()) return null;
  if (!playing) {
    // Always (re)wake: a suspend() may still be in flight from the idle timer.
    window.clearTimeout(suspendTimer);
    declarePlayback();
    ctx.resume();
    scheduleIdleSuspend(4000);
  }
  return { ctx, out: sfxBus, space: sfxSpace, echo: sfxEcho };
}

/** The interface-sound graph only if audio is already running: for sounds
    that aren't a response to a click (e.g. typing on the boot screen).
    Sounds queued on a sleeping context would all fire at once on wake. */
export function getLiveSfxGraph() {
  if (!built || ctx.state !== "running") return null;
  return { ctx, out: sfxBus, space: sfxSpace, echo: sfxEcho };
}

/** Hyperdrive: the pad filter opens wide and settles back. */
export function musicSweep(seconds = 2.6) {
  if (!playing || !padFilter) return;
  const f = padFilter.frequency;
  const t = ctx.currentTime;
  f.cancelScheduledValues(t);
  f.setValueAtTime(f.value, t);
  f.exponentialRampToValueAtTime(5200, t + seconds * 0.4);
  f.exponentialRampToValueAtTime(900, t + seconds);
}

/** 0..1 loudness of the music right now (0 when muted). */
let levelData = null;
export function getMusicLevel() {
  if (!playing || !analyser) return 0;
  levelData ??= new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(levelData);
  let sum = 0;
  for (let i = 1; i < 10; i++) sum += levelData[i];
  return sum / (9 * 255);
}

export function getAnalyser() {
  return playing ? analyser : null;
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** True while sound is on but waiting for the visitor's first click/tap. */
export function useSoundArmed() {
  return useSyncExternalStore(subscribe, () => armed && !playing, () => false);
}

export function useAmbientSound() {
  const isPlaying = useSyncExternalStore(subscribe, () => playing, () => false);
  return { playing: isPlaying, toggle };
}

/* Music starts on load. Browsers block audio until the visitor interacts
   (unless they already trust the site), so we try immediately and, if the
   audio context stays suspended, start on the first click / tap / key.
   A visitor who mutes it is remembered and never auto-started again. */
if (typeof window !== "undefined") {
  if (readPref()) {
    const resume = (e) => {
      // A tap on the sound toggle itself is handled by its click handler.
      if (e.target?.closest?.("[data-sound-toggle]")) return;
      if (!playing) play();
    };
    // Only these count as a "user activation" for audio.
    const events = ["pointerdown", "pointerup", "touchend", "keydown", "click"];
    events.forEach((ev) => window.addEventListener(ev, resume, { passive: true }));
    armed = true;
    pendingStartCleanup = () => {
      events.forEach((ev) => window.removeEventListener(ev, resume));
      pendingStartCleanup = null;
      armed = false;
      emit();
    };

    // Attempt a true autoplay once the page has loaded.
    // Once the page has settled: creating an audio context isn't free.
    const attempt = () =>
      window.requestIdleCallback ? window.requestIdleCallback(() => play(), { timeout: 1000 }) : play();
    if (document.readyState === "complete") attempt();
    else window.addEventListener("load", attempt, { once: true });
  }

  // Go quiet while the tab is hidden; pick back up when it returns.
  let resumeOnShow = false;
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden && playing) {
      resumeOnShow = true;
      stopScheduler();
      ctx.suspend();
    } else if (!document.hidden && resumeOnShow && playing) {
      resumeOnShow = false;
      ctx.resume().then(startScheduler);
    }
  });
}
