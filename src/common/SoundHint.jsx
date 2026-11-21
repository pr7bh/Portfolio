import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconX } from "@tabler/icons-react";
import { pause, play, useSoundArmed } from "./ambientAudio";
import { useMediaQuery } from "./hooks";

const ease = [0.22, 1, 0.36, 1];

/* Browsers only start audio after a click / tap / key press. While the
   score is waiting for that first gesture, this pill invites one. Any
   click anywhere starts the music (handled in ambientAudio); the × opts
   out and is remembered. */
export default function SoundHint() {
  const armed = useSoundArmed();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [ready, setReady] = useState(false);

  // Let the page settle (loader + hero entrance) before appearing.
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {armed && ready && (
        <motion.div
          key="sound-hint"
          initial={{ opacity: 0, y: -16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease }}
          className="pointer-events-none fixed inset-x-0 top-20 z-1100 flex justify-center px-4 md:top-24"
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/12 bg-[rgba(8,8,10,0.72)] p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => play()}
              data-magnetic="0.2"
              data-cursor="action"
              data-cursor-label="Play"
              className="flex items-center gap-3 rounded-full py-2 pl-3.5 pr-3 text-white/85 transition-colors hover:text-white"
            >
              <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="block w-[2px] rounded-full"
                    style={{
                      height: "100%",
                      background: `linear-gradient(to top, var(--cool), ${i % 2 ? "#fff" : "var(--warm)"})`,
                      transformOrigin: "bottom",
                      animation: `signalBar 1.1s ${i * 0.14}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </span>
              <span className="meta text-[0.62rem]! tracking-[0.18em]!">
                {canHover ? "Click anywhere for sound" : "Tap anywhere for sound"}
              </span>
            </button>
            <button
              type="button"
              data-sound-toggle
              onClick={() => pause()}
              aria-label="Keep music off"
              title="Keep music off"
              className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            >
              <IconX size={14} stroke={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
