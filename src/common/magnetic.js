/* Magnetic buttons, site-wide. Any element with data-magnetic (optionally
   a strength, e.g. data-magnetic="0.35") drifts toward the cursor while
   hovered and springs back on leave. It writes the CSS `translate`
   property (separate from `transform`), eased here in JS so it never
   fights an element's own transitions or transform animations.
   Desktop mice only, and off for reduced motion. */

const RANGE = 1.35; // keep the pull until the cursor is a bit outside the box
const FOLLOW = 0.2; // easing per frame toward the target offset

export function installMagnetic() {
  if (typeof window === "undefined") return () => {};
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // element -> { x, y, tx, ty } current and target offsets
  const moving = new Map();
  let active = null;
  let pointer = null;
  let raf = 0;

  const state = (el) => {
    let s = moving.get(el);
    if (!s) {
      s = { x: 0, y: 0, tx: 0, ty: 0 };
      moving.set(el, s);
    }
    return s;
  };

  const loop = () => {
    raf = 0;

    if (pointer) {
      const { x, y } = pointer;
      if (active) {
        const s = state(active);
        const r = active.getBoundingClientRect();
        // Box without our own offset, so the pull doesn't feed back on itself.
        const cx = r.left - s.x + r.width / 2;
        const cy = r.top - s.y + r.height / 2;
        const out =
          Math.abs(x - cx) > (r.width / 2) * RANGE + 8 || Math.abs(y - cy) > (r.height / 2) * RANGE + 8;
        if (out || !active.isConnected) {
          s.tx = s.ty = 0;
          active = null;
        } else {
          const k = parseFloat(active.dataset.magnetic) || 0.3;
          const max = Math.max(10, Math.min(r.width, r.height) * 0.45);
          s.tx = Math.max(-max, Math.min(max, (x - cx) * k));
          s.ty = Math.max(-max, Math.min(max, (y - cy) * k));
        }
      }
      if (!active) {
        const hit = document.elementFromPoint(x, y)?.closest?.("[data-magnetic]");
        if (hit) {
          active = hit;
          pointer = { x, y };
          raf = requestAnimationFrame(loop);
          return;
        }
      }
    }

    let busy = false;
    moving.forEach((s, el) => {
      s.x += (s.tx - s.x) * FOLLOW;
      s.y += (s.ty - s.y) * FOLLOW;
      const resting = el !== active && Math.abs(s.x) < 0.1 && Math.abs(s.y) < 0.1;
      if (resting) {
        el.style.translate = "";
        moving.delete(el);
        return;
      }
      el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      if (Math.abs(s.tx - s.x) > 0.1 || Math.abs(s.ty - s.y) > 0.1) busy = true;
    });
    if (busy) raf = requestAnimationFrame(loop);
  };

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const onMove = (e) => {
    if (!fine.matches || reduce.matches || e.pointerType !== "mouse") return;
    pointer = { x: e.clientX, y: e.clientY };
    kick();
  };

  const releaseAll = () => {
    active = null;
    pointer = null;
    moving.forEach((s) => {
      s.tx = 0;
      s.ty = 0;
    });
    kick();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", releaseAll);
  window.addEventListener("scroll", releaseAll, { passive: true });

  return () => {
    cancelAnimationFrame(raf);
    moving.forEach((_, el) => (el.style.translate = ""));
    moving.clear();
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("mouseleave", releaseAll);
    window.removeEventListener("scroll", releaseAll);
  };
}
