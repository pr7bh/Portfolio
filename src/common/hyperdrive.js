import { triggerWarp } from "./fx";
import { musicSweep } from "./ambientAudio";
import { playSfx } from "./uiSounds";
import { unlock } from "./achievements";
import { SECTIONS } from "./profile";

/** The hyperdrive easter egg (Konami code, or `warp` in the terminal). */
export function engageHyperdrive() {
  playSfx("warp"); // also buzzes on phones
  musicSweep();
  triggerWarp({ intensity: 1, duration: 2600 });
  unlock("hyperdrive");
  // Jump somewhere new while the streaks hide the move.
  window.setTimeout(() => {
    const here = SECTIONS.find((id) => {
      const r = document.getElementById(id)?.getBoundingClientRect();
      return r && r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2;
    });
    const choices = SECTIONS.filter((id) => id !== here && document.getElementById(id));
    const target = choices[Math.floor(Math.random() * choices.length)];
    document.getElementById(target)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, 1050);
}
