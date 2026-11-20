import { useEffect, useRef } from "react";
import { getAnalyser, useAmbientSound } from "./ambientAudio";

const BARS = 5;
// Analyser bins sampled for each bar, low → high.
const BINS = [1, 3, 5, 8, 12];

/* Equaliser-style toggle for the ambient score. While playing, the bars
   follow the real audio; muted, they rest as a flat line of dots. */
export default function SoundToggle({ className = "", showLabel = false }) {
  const { playing, toggle } = useAmbientSound();
  const barsRef = useRef([]);

  useEffect(() => {
    const bars = barsRef.current;
    if (!playing) {
      bars.forEach((b) => b && (b.style.transform = "scaleY(0.18)"));
      return undefined;
    }

    let raf = 0;
    let data = null;
    const loop = () => {
      const analyser = getAnalyser();
      if (analyser) {
        data ??= new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        bars.forEach((b, i) => {
          if (!b) return;
          const v = data[BINS[i]] / 255;
          b.style.transform = `scaleY(${Math.min(1, 0.22 + v * 1.25).toFixed(3)})`;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <button
      type="button"
      data-sound-toggle
      data-cursor="action"
      data-cursor-label={playing ? "Mute" : "Play"}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Mute ambient music" : "Play ambient music"}
      title={playing ? "Mute music" : "Play music"}
      className={`group relative flex items-center justify-center gap-2.5 transition-colors duration-300 ${className}`}
    >
      <span className="relative flex h-4 items-center gap-[3px]" aria-hidden="true">
        {Array.from({ length: BARS }, (_, i) => (
          <span
            key={i}
            ref={(el) => (barsRef.current[i] = el)}
            className="block h-4 w-[2px] origin-center rounded-full transition-[background-color] duration-300"
            style={{
              transform: "scaleY(0.18)",
              background: playing
                ? `linear-gradient(to top, var(--cool), ${i % 2 ? "#fff" : "var(--warm)"})`
                : "rgba(255,255,255,0.55)",
            }}
          />
        ))}
      </span>
      {showLabel && (
        <span className="meta text-[0.6rem]! tracking-[0.2em]! text-current">
          {playing ? "Sound on" : "Sound off"}
        </span>
      )}
    </button>
  );
}
