import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789PRABHJOTSINGH<>/{}=+";
const LINES = ["Wake up, guest…", "You're inside PRABHJOT.SYS.", "Press any key to jack out."];

/* Full-screen digital rain in the site's colours. Any key, click or tap
   (or 14 seconds) exits. */
export default function MatrixRain({ onDone }) {
  const canvasRef = useRef(null);
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let cols = [];
    const font = 16;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#020303";
      g.fillRect(0, 0, w, h);
      const n = Math.ceil(w / font);
      cols = Array.from({ length: n }, (_, i) => cols[i] ?? {
        y: Math.random() * -h,
        speed: 0.6 + Math.random() * 0.9,
        warm: Math.random() < 0.08,
      });
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30fps keeps the classic stutter
      last = now;
      g.fillStyle = "rgba(2,3,3,0.09)";
      g.fillRect(0, 0, w, h);
      g.font = `${font}px "Roboto Mono", ui-monospace, monospace`;
      cols.forEach((c, i) => {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        const x = i * font;
        // Bright head, coloured trail (left behind by the fade).
        g.fillStyle = "#e9fdff";
        g.shadowColor = c.warm ? "rgba(255,162,76,0.9)" : "rgba(147,241,255,0.9)";
        g.shadowBlur = 8;
        g.fillText(ch, x, c.y);
        g.shadowBlur = 0;
        g.fillStyle = c.warm ? "rgba(255,162,76,0.85)" : "rgba(95,230,255,0.8)";
        g.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, c.y - font);
        c.y += font * c.speed;
        if (c.y > h + Math.random() * h * 0.6) {
          c.y = Math.random() * -200;
          c.speed = 0.6 + Math.random() * 0.9;
        }
      });
    };
    if (!reduce) raf = requestAnimationFrame(frame);

    // Consume the exit key so it isn't typed into the terminal that reopens.
    const exit = (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      onDone();
    };
    const t = window.setTimeout(exit, 14000);
    // Ignore the key press that launched it.
    const arm = window.setTimeout(() => {
      window.addEventListener("keydown", exit, { once: true, capture: true });
      window.addEventListener("pointerdown", exit, { once: true });
    }, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.clearTimeout(arm);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", exit, { capture: true });
      window.removeEventListener("pointerdown", exit);
    };
  }, [onDone]);

  // Type the message lines one after another.
  useEffect(() => {
    if (line >= LINES.length) return undefined;
    const target = LINES[line];
    if (typed.length < target.length) {
      const id = window.setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 55);
      return () => window.clearTimeout(id);
    }
    if (line < LINES.length - 1) {
      const id = window.setTimeout(() => {
        setLine((l) => l + 1);
        setTyped("");
      }, 1400);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [line, typed]);

  return (
    <motion.div
      className="fixed inset-0 z-10040 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      aria-label="Digital rain. Press any key to exit."
      role="dialog"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center px-6">
        <p
          className="rounded-lg bg-black/70 px-5 py-3 text-center text-sm text-[#bff8ff] shadow-[0_0_40px_rgba(0,0,0,0.9)] md:text-base"
          style={{ fontFamily: "var(--font-mono)", textShadow: "0 0 10px rgba(147,241,255,0.8)" }}
        >
          {typed}
          <span className="boot-caret" aria-hidden="true" />
        </p>
      </div>
    </motion.div>
  );
}
