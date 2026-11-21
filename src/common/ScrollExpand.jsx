'use client';

import { useCallback, useEffect, useRef } from 'react';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const GLOW_STYLES = `
  @keyframes seGlowPulse {
    0%,100% {
      box-shadow:
        0 0 0 1.5px rgba(255,255,255,0.55),
        0 0 14px  4px rgba(255,255,255,0.40),
        0 0 36px 12px rgba(255,255,255,0.18),
        0 0 72px 28px rgba(255,255,255,0.08),
        0 0 140px 65px rgba(255,255,255,0.03);
    }
    50% {
      box-shadow:
        0 0 0 2px   rgba(255,255,255,0.95),
        0 0 20px  7px rgba(255,255,255,0.70),
        0 0 52px 18px rgba(255,255,255,0.34),
        0 0 105px 44px rgba(255,255,255,0.14),
        0 0 190px 95px rgba(255,255,255,0.05);
    }
  }
  @keyframes seGlowSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

const ScrollExpand = ({
  src = '',
  mediaType = 'image',
  poster = '',
  alt = '',
  title = '',
  scrollHint = '',
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  mediaFocus = null,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  glow = false,
  backdrop = null,
  onProgress,
  children,
  className = '',
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);
  const glowRef = useRef(null);

  const lastProgress = useRef(0);
  const propsRef = useRef({});
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    mediaFocus,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
    onProgress
  };

  const applyProgress = useCallback(p => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;
    lastProgress.current = p;
    c.onProgress?.(p);

    // The frame finishes opening at 78% of the scroll so the hero content
    // (which fades in from 68%) never sits over a black border.
    const e = smoothstep(0, 0.78, p);

    const w = c.startWidth + (100 - c.startWidth) * e;
    const h = c.startHeight + (100 - c.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    const nw = media.naturalWidth || media.videoWidth;
    const nh = media.naturalHeight || media.videoHeight;
    if (c.mediaFocus && nw && nh) {
      // mediaFocus ({x, y} as fractions of the source image) pins that point
      // to the centre of the frame at every stage of the expansion. The
      // image is scaled just enough that, once shifted, it still covers the
      // visible part of the frame — never leaving a gap at an edge.
      const fw = media.clientWidth;
      const fh = media.clientHeight;
      const cover = Math.max(fw / nw, fh / nh);
      const left = (fw - nw * cover) / 2;
      const top = (fh - nh * cover) / 2;
      const fx = left + c.mediaFocus.x * nw * cover;
      const fy = top + c.mediaFocus.y * nh * cover;
      // object-fit: cover crops the picture to the element's own box, so the
      // usable pixels around the focus end at 0 and fw / fh — not at the
      // un-cropped image edges.
      const room = (halfW, halfH) =>
        Math.max(halfW / fx, halfW / (fw - fx), halfH / fy, halfH / (fh - fy));
      const fullScale = Math.max(1, room(fw / 2, fh / 2));
      const needed = room((fw * w) / 200, (fh * h) / 200);
      const ez = e;
      const scale = Math.max(needed, c.mediaZoom + (fullScale - c.mediaZoom) * ez);
      media.style.transformOrigin = `${fx}px ${fy}px`;
      media.style.transform = `translate3d(${fw / 2 - fx}px, ${fh / 2 - fy}px, 0) scale(${scale})`;
    } else {
      media.style.transformOrigin = '';
      media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;
    }
    media.style.filter = `grayscale(${1 - e})`;

    if (scrimRef.current) scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.68, 1, p);
      overlayRef.current.style.opacity = `${inn}`;
      // Links in the overlay must not be clickable while it is still invisible.
      overlayRef.current.style.pointerEvents = inn > 0.6 ? 'auto' : 'none';
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
    }

    if (glowRef.current) {
      const gone = smoothstep(0, 0.28, p);
      glowRef.current.style.opacity = `${1 - gone}`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    let lvhProbe = null;
    const largeViewportHeight = () => {
      if (!CSS.supports?.('height', '100lvh')) return 0;
      if (!lvhProbe) {
        lvhProbe = document.createElement('div');
        lvhProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
        document.body.appendChild(lvhProbe);
      }
      return lvhProbe.offsetHeight;
    };

    const measure = () => {
      const c = propsRef.current;
      // On phones the visible height changes as the browser bar slides in
      // and out. Size to the *large* viewport (bar hidden) so the stage never
      // comes up short and leaves a black band, and so the page doesn't jump.
      stageH = c.useWindowScroll ? Math.max(window.innerHeight, largeViewportHeight()) : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${stageH * (1 + Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance))}px`;

      const w = root.clientWidth || stageH;
      stage.style.setProperty('--se-title-size', `${clamp(w * 0.075, 20, 84)}px`);
    };

    const readProgress = () => {
      const c = propsRef.current;
      if (!c.enabled) return 1;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const c = propsRef.current;
      const k = c.smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * c.smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (propsRef.current.smoothing <= 0 || reduceMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(root);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      lvhProbe?.remove();
    };
  }, [applyProgress, useWindowScroll]);

  const media =
    mediaType === 'video' ? (
      <video
        ref={mediaRef}
        className="
            absolute inset-0
            w-full h-full
            object-cover
            origin-center
            select-none
            [will-change:transform,filter]
            "
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <img
        ref={mediaRef}
        className="
            absolute inset-0
            w-full h-full
            object-cover
            origin-center
            select-none
            [will-change:transform,filter]
            "
        src={src}
        alt={alt}
        draggable={false}
        // The hero photo is the page's main image: fetch it first.
        fetchPriority="high"
        decoding="async"
        onLoad={() => applyProgress(lastProgress.current)}
      />
    );

  return (

      <div
  ref={rootRef}
  className={`relative h-full w-full ${
    useWindowScroll
      ? "overflow-visible"
      : "overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
  } ${className}`.trim()}
  style={style}
  {...rest}
>

      <div ref={trackRef} className="relative w-full">
        <div ref={stageRef} className="sticky top-0 w-full overflow-hidden [--se-title-size:4rem]">

          {backdrop ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {backdrop}
            </div>
          ) : null}

          {/* ── Glow ring (only when glow prop is true) ── */}
          {glow && (
            <>
              <style>{GLOW_STYLES}</style>
              {/*
                No z-index here — this div is behind frameRef by DOM order.
                box-shadow extends outside the circle boundary and is visible.
                Child arc div also extends outside via negative inset.
              */}
              <div
                ref={glowRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${startWidth}%`,
                  height: `${startHeight}%`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  /* box-shadow is animated by seGlowPulse keyframe */
                  animation: 'seGlowPulse 3s ease-in-out infinite',
                }}
              >
                {/*
                  Rotating comet arc — sits 6px outside the circle boundary.
                  The mask cuts the conic-gradient down to an 8px ring; the
                  portion inside the circle is hidden behind the portrait image,
                  the 6px outside the circle edge is fully visible.
                */}
                <div style={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  background: [
                    'conic-gradient(from 0deg,',
                    '  transparent   0%,',
                    '  transparent  58%,',
                    '  rgba(255,255,255,0.00) 63%,',
                    '  rgba(255,255,255,0.95) 70%,',  /* bright comet head */
                    '  rgba(255,255,255,0.40) 75%,',  /* tail fade */
                    '  rgba(255,255,255,0.00) 81%,',
                    '  transparent  85%,',
                    '  transparent 100%',
                    ')',
                  ].join(' '),
                  WebkitMaskImage: 'radial-gradient(circle, transparent calc(100% - 8px), black calc(100% - 8px))',
                  maskImage:       'radial-gradient(circle, transparent calc(100% - 8px), black calc(100% - 8px))',
                  animation: 'seGlowSpin 8s linear infinite',
                }} />

                {/*
                  Second, slower arc on the opposite side — adds depth without clutter.
                */}
                <div style={{
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  background: [
                    'conic-gradient(from 180deg,',
                    '  transparent   0%,',
                    '  transparent  70%,',
                    '  rgba(255,255,255,0.00) 73%,',
                    '  rgba(255,255,255,0.45) 77%,',
                    '  rgba(255,255,255,0.00) 81%,',
                    '  transparent  84%,',
                    '  transparent 100%',
                    ')',
                  ].join(' '),
                  WebkitMaskImage: 'radial-gradient(circle, transparent calc(100% - 5px), black calc(100% - 5px))',
                  maskImage:       'radial-gradient(circle, transparent calc(100% - 5px), black calc(100% - 5px))',
                  animation: 'seGlowSpin 14s linear infinite',
                }} />
              </div>
            </>
          )}

          <div
            ref={frameRef}
            className="absolute inset-0 [clip-path:inset(21%_29%_21%_29%_round_24px)] [will-change:clip-path]"
          >
            {media}
            <div
              ref={scrimRef}
              className="absolute inset-0 opacity-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.75),rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.35))]"
            />
            {children ? (
              <div
                ref={overlayRef}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-[6%] opacity-0 [will-change:opacity,transform]"
              >
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div
              ref={titleRef}
              className="absolute inset-0 flex items-center justify-center m-0 px-[6%] text-center font-bold leading-none tracking-[-0.03em] text-white [font-size:var(--se-title-size)] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] pointer-events-none [will-change:opacity,transform] "
            >
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div
              ref={hintRef}
              className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none [will-change:opacity,transform] md:bottom-8"
            >
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
