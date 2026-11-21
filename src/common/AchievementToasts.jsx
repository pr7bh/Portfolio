import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconCompass,
  IconKey,
  IconLayoutGrid,
  IconMoonStars,
  IconMusic,
  IconRocket,
  IconSparkles,
  IconTerminal2,
  IconTrophy,
} from "@tabler/icons-react";
import { onUnlock, progress, unlock } from "./achievements";
import { useAmbientSound } from "./ambientAudio";
import { useActiveSection } from "./hooks";
import { SECTIONS } from "./profile";
import { haptic } from "./fx";

const BADGE_ICONS = {
  terminal: IconTerminal2,
  dj: IconMusic,
  explorer: IconCompass,
  secret: IconKey,
  hyperdrive: IconRocket,
  curator: IconLayoutGrid,
  oracle: IconSparkles,
  nightowl: IconMoonStars,
  completionist: IconTrophy,
};

const ease = [0.22, 1, 0.36, 1];

/* "Achievement unlocked" toasts, plus the badges that are earned simply by
   being on the page (music, exploring, visiting late at night). */
export default function AchievementToasts() {
  const [queue, setQueue] = useState([]);
  const { playing } = useAmbientSound();
  const active = useActiveSection(SECTIONS);
  const seen = useRef(new Set());

  useEffect(
    () =>
      onUnlock((badge) => {
        haptic("achievement");
        setQueue((q) => [...q, { ...badge, key: `${badge.id}-${Date.now()}`, ...progress() }]);
      }),
    []
  );

  // One toast at a time; each stays ~4.5s.
  useEffect(() => {
    if (!queue.length) return undefined;
    const id = window.setTimeout(() => setQueue((q) => q.slice(1)), 4500);
    return () => window.clearTimeout(id);
  }, [queue]);

  useEffect(() => {
    if (playing) unlock("dj");
  }, [playing]);

  useEffect(() => {
    seen.current.add(active);
    if (SECTIONS.every((id) => seen.current.has(id))) unlock("explorer");
  }, [active]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5) {
      const id = window.setTimeout(() => unlock("nightowl"), 6000);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, []);

  const toast = queue[0];
  const Icon = toast ? BADGE_ICONS[toast.id] || IconTrophy : null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-10030 flex justify-center px-4 md:bottom-8"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.key}
            role="status"
            initial={{ opacity: 0, y: 30, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease }}
            className="achievement-toast pointer-events-auto relative flex w-full max-w-sm items-center gap-4 overflow-hidden rounded-2xl border border-white/12 bg-[rgba(8,8,10,0.82)] p-3 pr-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span aria-hidden="true" className="achievement-toast__sweep" />
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-(--warm)/40 bg-(--warm)/10 text-(--warm) shadow-[0_0_24px_-4px_rgba(255,162,76,0.6)]">
              <Icon size={24} stroke={1.6} />
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-[0.58rem] uppercase tracking-[0.24em] text-(--cool)">
                Achievement unlocked
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-white" style={{ fontFamily: "'Nippo', sans-serif" }}>
                {toast.title}
              </span>
              <span className="block truncate text-[0.68rem] text-white/60">{toast.desc}</span>
            </span>
            <span className="relative self-start text-[0.6rem] tabular-nums text-white/55">
              {toast.count}/{toast.total}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

