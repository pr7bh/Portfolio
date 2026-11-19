import { useEffect, useRef } from "react";
import { useMediaQuery } from "./hooks";
import "./CustomCursor.css";

const TRAIL = 6;
const INTERACTIVE = 'a[href], button, [role="button"], label, summary, select, .custom-cursor--action';
const TEXT_ENTRY =
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

// Context is declared in markup: data-cursor="view" data-cursor-label="View"
// for a labelled state, data-cursor-drag="Drag" for a draggable surface.
function resolve(target) {
  if (!target?.closest) return ["default", ""];
  if (target.closest(TEXT_ENTRY)) return ["text", ""];
  if (target.closest(".custom-cursor--close")) return ["close", ""];
  const ctx = target.closest("[data-cursor]");
  if (ctx) return [ctx.dataset.cursor, ctx.dataset.cursorLabel || ""];
  if (target.closest(INTERACTIVE)) return ["action", ""];
  return ["default", ""];
}

function CustomCursor() {
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine)");
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const squashRef = useRef(null);
  const labelRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    const squash = squashRef.current;
    const labelEl = labelRef.current;
    const trailEls = trailRefs.current;
    if (!root || !dot || !ringEl || !squash || !labelEl) return;

    const html = document.documentElement;
    html.classList.add("has-custom-cursor");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.reduced = String(reduce);

    const pointer = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    const trail = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));
    let raf = 0;
    let last = 0;
    let energy = 0;
    let visible = false;
    let press = null;
    let dragging = false;
    let state = "default";
    let label = "";

    const setState = (nextState, nextLabel = "") => {
      if (nextState !== state) {
        state = nextState;
        root.dataset.state = nextState;
      }
      if (nextLabel !== label) {
        label = nextLabel;
        labelEl.textContent = nextLabel;
      }
    };

    const place = (el, x, y) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    // Frame-rate independent easing; the loop sleeps once everything settles.
    const tick = (now) => {
      const dt = last ? Math.min(64, now - last) / 16.667 : 1;
      last = now;

      const k = reduce ? 1 : 1 - Math.pow(0.78, dt);
      const vx = pointer.x - ring.x;
      const vy = pointer.y - ring.y;
      ring.x += vx * k;
      ring.y += vy * k;
      place(ringEl, ring.x, ring.y);

      const lag = Math.hypot(vx, vy);
      const stretch = reduce ? 0 : Math.min(lag / 140, 0.28);
      squash.style.transform = `rotate(${Math.atan2(vy, vx)}rad) scale(${1 + stretch}, ${1 - stretch * 0.55})`;

      let tail = 0;
      if (!reduce) {
        const f = 1 - Math.pow(0.55, dt);
        let px = pointer.x;
        let py = pointer.y;
        for (let i = 0; i < TRAIL; i++) {
          const p = trail[i];
          p.x += (px - p.x) * f;
          p.y += (py - p.y) * f;
          place(trailEls[i], p.x, p.y);
          px = p.x;
          py = p.y;
        }
        tail = Math.hypot(pointer.x - px, pointer.y - py);
        energy += (Math.min(1, tail / 70) - energy) * (1 - Math.pow(0.8, dt));
        root.style.setProperty("--cursor-energy", energy.toFixed(3));
      }

      const settled = lag < 0.15 && tail < 0.15 && energy < 0.01;
      raf = settled ? 0 : requestAnimationFrame(tick);
      if (!raf) last = 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      place(dot, pointer.x, pointer.y);

      if (!visible) {
        visible = true;
        root.dataset.visible = "true";
        ring.x = pointer.x;
        ring.y = pointer.y;
        trail.forEach((p) => {
          p.x = pointer.x;
          p.y = pointer.y;
        });
      }

      if (press && !dragging && press.dragLabel && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) {
        dragging = true;
        setState("drag", press.dragLabel);
      }
      wake();
    };

    // State only changes when the hovered element changes, not on every move.
    const onOver = (e) => {
      if (dragging) return;
      const [s, l] = resolve(e.target);
      setState(s, l);
    };

    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      root.dataset.pressed = "true";
      const zone = e.target.closest?.("[data-cursor-drag]");
      press = { x: e.clientX, y: e.clientY, dragLabel: zone?.dataset.cursorDrag || "" };
    };

    const onUp = (e) => {
      root.dataset.pressed = "false";
      press = null;
      if (dragging) {
        dragging = false;
        const [s, l] = resolve(document.elementFromPoint(e.clientX, e.clientY));
        setState(s, l);
      }
    };

    const onLeave = () => {
      visible = false;
      root.dataset.visible = "false";
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    html.addEventListener("mouseleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      html.classList.remove("has-custom-cursor");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="cursor" data-state="default" data-visible="false" aria-hidden="true">
      {Array.from({ length: TRAIL }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className="cursor__trail"
          style={{ "--i": i }}
        />
      ))}
      <div ref={ringRef} className="cursor__ring">
        <div ref={squashRef} className="cursor__squash">
          <div className="cursor__shape" />
        </div>
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  );
}

export default CustomCursor;
