import { useEffect, useRef } from "react";
import { onInterfaceClick } from "./uiSounds";

const COOL = [147, 241, 255];
const WARM = [255, 162, 76];
const WHITE = [255, 255, 255];

// Spark colour follows the kind of click, like the sounds do.
const PALETTE = {
  launch: [WARM, WHITE],
  confirm: [WARM, COOL, WHITE],
  open: [COOL, WHITE],
  close: [WARM],
  nav: [COOL, WHITE],
  boot: [COOL, WARM, WHITE],
  space: [COOL, WARM],
};

/* A small burst of light wherever the visitor clicks or taps. Draws on
   one canvas and only animates while sparks are alive. */
export default function ClickSparks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    let dpr = 1;
    const sparks = [];
    const rings = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (now) => {
      const dt = last ? Math.min(48, now - last) / 16.667 : 1;
      last = now;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.globalCompositeOperation = "lighter";

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.t += dt / 26;
        if (r.t >= 1) {
          rings.splice(i, 1);
          continue;
        }
        const e = 1 - (1 - r.t) ** 3;
        g.beginPath();
        g.arc(r.x, r.y, 4 + e * r.size, 0, Math.PI * 2);
        g.strokeStyle = `rgba(${r.c}, ${(1 - r.t) * 0.55})`;
        g.lineWidth = 1.25;
        g.stroke();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt / s.span;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        const px = s.x;
        const py = s.y;
        s.vx *= 0.9 ** dt;
        s.vy = s.vy * 0.9 ** dt + 0.04 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        g.beginPath();
        g.moveTo(px - s.vx * 1.6, py - s.vy * 1.6);
        g.lineTo(s.x, s.y);
        g.strokeStyle = `rgba(${s.c}, ${s.life * 0.95})`;
        g.lineWidth = 1.4 * s.life + 0.3;
        g.lineCap = "round";
        g.stroke();
      }

      raf = sparks.length || rings.length ? requestAnimationFrame(frame) : 0;
      if (!raf) {
        last = 0;
        g.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const off = onInterfaceClick(({ kind, x, y }) => {
      const colours = PALETTE[kind] || [WHITE, COOL];
      const count = kind === "space" || kind === "boot" ? 14 : 9;
      const power = kind === "launch" || kind === "boot" ? 1.5 : 1;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const v = (2.2 + Math.random() * 2.6) * power;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          span: 22 + Math.random() * 16,
          c: colours[i % colours.length].join(","),
        });
      }
      rings.push({ x, y, t: 0, size: 26 * power, c: colours[0].join(",") });
      if (!raf) raf = requestAnimationFrame(frame);
    });

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-99998 h-full w-full"
    />
  );
}
