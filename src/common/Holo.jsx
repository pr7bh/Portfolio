import { useEffect, useRef } from "react";

/* Holographic card: a 3D tilt with a rainbow foil and glare that follow
   the cursor. On phones it follows the device's tilt (Android), and where
   tilt isn't available (iOS needs a permission prompt) the foil drifts on
   its own while `active`. Off for reduced motion. */
export default function Holo({ children, className = "", max = 9, active = true, gyro = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const target = { rx: 0, ry: 0, mx: 50, my: 50, o: 0 };
    const cur = { ...target };
    let raf = 0;
    let gyroSeen = false;
    let base = null;
    let auto = false;
    let autoStart = 0;

    const loop = (now) => {
      raf = 0;
      if (auto && !gyroSeen) {
        const t = (now - autoStart) / 1000;
        target.ry = Math.sin(t * 0.9) * max * 0.6;
        target.rx = Math.cos(t * 0.7) * max * 0.35;
        target.mx = 50 + Math.sin(t * 0.9) * 40;
        target.my = 50 + Math.cos(t * 0.7) * 30;
        target.o = 0.55;
      }
      let moving = auto;
      for (const k of Object.keys(target)) {
        cur[k] += (target[k] - cur[k]) * 0.14;
        if (Math.abs(target[k] - cur[k]) > 0.01) moving = true;
      }
      el.style.setProperty("--rx", `${cur.rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${cur.ry.toFixed(2)}deg`);
      el.style.setProperty("--mx", `${cur.mx.toFixed(1)}%`);
      el.style.setProperty("--my", `${cur.my.toFixed(1)}%`);
      el.style.setProperty("--o", cur.o.toFixed(3));
      if (moving) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      target.ry = (px - 0.5) * 2 * max;
      target.rx = -(py - 0.5) * 2 * max;
      target.mx = px * 100;
      target.my = py * 100;
      target.o = 1;
      kick();
    };
    const onLeave = () => {
      Object.assign(target, { rx: 0, ry: 0, mx: 50, my: 50, o: 0 });
      kick();
    };

    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      gyroSeen = true;
      base ??= { g: e.gamma, b: e.beta };
      const gx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 25));
      const by = Math.max(-1, Math.min(1, (e.beta - base.b) / 25));
      target.ry = gx * max;
      target.rx = -by * max;
      target.mx = 50 + gx * 45;
      target.my = 50 + by * 45;
      target.o = 0.85;
      kick();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    let autoTimer = 0;
    if (gyro && active) {
      window.addEventListener("deviceorientation", onOrient);
      // No tilt data after a moment (iOS, desktop): let the foil drift.
      autoTimer = window.setTimeout(() => {
        if (!gyroSeen) {
          auto = true;
          autoStart = performance.now();
          kick();
        }
      }, 900);
    } else if (!active) {
      onLeave();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(autoTimer);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("deviceorientation", onOrient);
      el.style.setProperty("--o", "0");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
  }, [max, active, gyro]);

  return (
    <div ref={ref} className={`holo ${className}`}>
      <div className="holo__inner">
        {children}
        <span aria-hidden="true" className="holo__foil" />
        <span aria-hidden="true" className="holo__glare" />
      </div>
    </div>
  );
}
