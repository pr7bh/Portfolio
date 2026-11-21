import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { getMusicLevel } from "./ambientAudio";
import { onWarp } from "./fx";

const vertex = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = (octaves) => /* glsl */ `
precision highp float;
#define OCTAVES ${octaves}

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uProgress;
uniform float uIntro;
uniform float uRadius;
uniform float uBeat;   // 0..1 music loudness (bass-weighted), smoothed
uniform float uFlow;   // ring travel; runs fast during hyperdrive
uniform float uWarp;   // 0..1 hyperdrive intensity

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  vec2 c = p - uMouse * 0.035;
  float r = length(c);
  vec2 dir = c / max(r, 1e-4);
  float ang = atan(c.y, c.x);
  float t = uTime;

  float e = uProgress * uProgress * (3.0 - 2.0 * uProgress);
  float R = uRadius * (1.0 + e * 2.6) * (1.0 + uBeat * 0.03);
  float d = r - R;
  float outside = smoothstep(-0.004, 0.03, d);

  // Log-spaced filaments drifting outward: a tunnel of light around the portal.
  float lr = log(max(r, 1e-3));
  float warp = fbm(dir * 1.8 + vec2(lr * 1.5 - t * 0.12, t * 0.05));
  float rings = pow(1.0 - abs(sin(lr * 16.0 - uFlow + warp * 4.0)), mix(10.0, 6.0, uBeat));
  float filaments = rings * outside * exp(-max(d, 0.0) * mix(2.8, 1.6, max(uBeat, uWarp)));

  // Corona hugging the rim, thickness modulated by noise.
  float n = fbm(dir * 3.0 + vec2(t * 0.08, -t * 0.05));
  float corona = exp(-abs(d) * mix(64.0, 18.0, n)) * (0.3 + 0.95 * n) * (1.0 + uBeat * 0.9 + uWarp);

  float haze = exp(-max(d, 0.0) * 3.0) * 0.12 * outside;

  // Key light follows the cursor; defaults to overhead.
  vec2 ld = normalize(uMouse + vec2(0.0001, 0.6));
  float facing = mix(0.3, 1.0, 0.5 + 0.5 * dot(dir, ld));

  float side = 0.5 + 0.5 * sin(ang + t * 0.08);
  vec3 tint = mix(vec3(0.58, 0.94, 1.0), vec3(1.0, 0.64, 0.30), side);

  vec3 col = vec3(1.0, 0.97, 0.92) * corona * 0.85 + tint * (filaments * (0.42 + uBeat * 0.7 + uWarp * 1.2) + haze);
  col *= facing;
  col *= smoothstep(1.5, 0.25, length(p));
  col *= 0.92 + 0.16 * hash(gl_FragCoord.xy + fract(t * 7.0) * 91.0);
  col *= uIntro * (1.0 - smoothstep(0.45, 0.92, uProgress));
  col = 1.0 - exp(-col * 1.6);

  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
}
`;

// The portrait circle is 55vmin wide, i.e. a radius of 0.275 in shader units.
const PORTRAIT_RADIUS = 0.275;

function HeroPortal({ progressRef, onUnsupported }) {
  const containerRef = useRef(null);
  const onUnsupportedRef = useRef(onUnsupported);
  onUnsupportedRef.current = onUnsupported;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const small = window.matchMedia("(max-width: 767px)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5),
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
      });
    } catch {
      onUnsupportedRef.current?.();
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    // Absolutely positioned so the canvas never contributes to layout width;
    // OGL's setSize writes pixel sizes that would otherwise widen the page on phones.
    const fill = () => {
      Object.assign(gl.canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
    };
    fill();
    container.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment: fragment(small ? 3 : 5),
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uProgress: { value: 0 },
        uBeat: { value: 0 },
        uFlow: { value: 0 },
        uWarp: { value: 0 },
        uIntro: { value: reduce ? 1 : 0 },
        uRadius: { value: PORTRAIT_RADIUS },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    let raf = 0;
    let visible = true;
    let time = 0;
    let last = performance.now();
    const born = last;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let beat = 0;
    let flow = 0;
    let warp = 0;
    const offWarp = onWarp(({ intensity }) => {
      warp = Math.max(warp, intensity);
      schedule();
    });

    const draw = () => {
      if (u.uProgress.value < 0.97) renderer.render({ scene: mesh });
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduce) {
        time += dt;
        const k = 1 - Math.exp(-dt * 2.5);
        mouse.x += (mouse.tx - mouse.x) * k;
        mouse.y += (mouse.ty - mouse.y) * k;
        const t = Math.min(1, Math.max(0, (now - born - 500) / 1800));
        u.uIntro.value = 1 - Math.pow(1 - t, 3);

        // Pulse with the music: quick attack, slower release.
        const level = Math.min(1, getMusicLevel() * 2.4);
        beat += (level - beat) * (level > beat ? 1 - Math.exp(-dt * 18) : 1 - Math.exp(-dt * 4));
        warp *= Math.exp(-dt * 1.6);
        flow += dt * (0.55 + beat * 0.9 + warp * 9);
      }

      u.uTime.value = time;
      u.uMouse.value = [mouse.x, mouse.y];
      u.uProgress.value = progressRef?.current ?? 0;
      u.uBeat.value = beat;
      u.uFlow.value = flow;
      u.uWarp.value = warp;
      draw();

      if (!reduce) schedule();
    };

    function schedule() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      fill();
      u.uRes.value = [gl.canvas.width, gl.canvas.height];
      schedule();
    };

    const onPointer = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    io.observe(container);

    if (finePointer && !reduce) window.addEventListener("pointermove", onPointer, { passive: true });
    // With reduced motion there is no loop; redraw only when scroll changes the scene.
    if (reduce) window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      offWarp();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", schedule);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [progressRef]);

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />;
}

export default HeroPortal;
