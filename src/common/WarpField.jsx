import { useEffect, useRef } from "react";
import { onWarp, installKonami } from "./fx";
import { engageHyperdrive } from "./hyperdrive";

const COLOURS = ["147,241,255", "255,255,255", "255,162,76", "200,250,255"];

/* Star-streak overlay drawn on one canvas, only while a warp is running.
   Nav jumps get a short, light burst; hyperdrive gets the full thing. */
export default function WarpField() {
  const canvasRef = useRef(null);

  useEffect(() => installKonami(engageHyperdrive), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    let dpr = 1;
    let w = 0;
    let h = 0;
    let raf = 0;
    let stars = [];
    let run = null; // { start, duration, intensity }

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (z = Math.random()) => ({
      x: (Math.random() * 2 - 1) * 1.2,
      y: (Math.random() * 2 - 1) * 1.2,
      z: 0.15 + z * 0.85,
      c: COLOURS[(Math.random() * COLOURS.length) | 0],
    });

    const content = () => document.querySelector("main");

    const frame = (now) => {
      raf = 0;
      if (!run) return;
      const t = (now - run.start) / run.duration;
      if (t >= 1) {
        run = null;
        g.clearRect(0, 0, canvas.width, canvas.height);
        const main = content();
        if (main) main.style.filter = "";
        return;
      }
      // Envelope: punch in fast, ease out long.
      const env = t < 0.22 ? t / 0.22 : Math.pow(1 - (t - 0.22) / 0.78, 1.6);
      const power = env * run.intensity;
      const focal = Math.min(w, h) * 0.5;
      const cx = w / 2;
      const cy = h / 2;

      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);

      // Centre flash
      const flash = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      flash.addColorStop(0, `rgba(200,245,255,${0.16 * power})`);
      flash.addColorStop(0.4, `rgba(147,241,255,${0.05 * power})`);
      flash.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = flash;
      g.fillRect(0, 0, w, h);

      g.globalCompositeOperation = "lighter";
      g.lineCap = "round";
      const speed = 0.012 + power * 0.05;
      for (const s of stars) {
        const px = cx + (s.x / s.z) * focal;
        const py = cy + (s.y / s.z) * focal;
        s.z -= speed;
        if (s.z <= 0.04) {
          Object.assign(s, spawn(1));
          continue;
        }
        const nx = cx + (s.x / s.z) * focal;
        const ny = cy + (s.y / s.z) * focal;
        const a = Math.min(1, (1 - s.z) * 1.4) * power;
        g.strokeStyle = `rgba(${s.c},${a})`;
        g.lineWidth = (1 - s.z) * 2.2 + 0.4;
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(nx, ny);
        g.stroke();
      }
      g.globalCompositeOperation = "source-over";

      // Motion blur on the page itself during the burst.
      const main = content();
      if (main) main.style.filter = power > 0.05 ? `blur(${(power * 4).toFixed(2)}px)` : "";

      raf = requestAnimationFrame(frame);
    };

    const off = onWarp(({ intensity, duration }) => {
      const count = Math.round(90 + intensity * 220);
      if (!run || stars.length < count) stars = Array.from({ length: count }, () => spawn());
      run = { start: performance.now(), duration, intensity: Math.max(run?.intensity ?? 0, intensity) };
      if (!raf) raf = requestAnimationFrame(frame);
    });

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      const main = content();
      if (main) main.style.filter = "";
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-1150 h-full w-full"
    />
  );
}
