import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import BootScreen from "./BootScreen";
import { markIntroReady, rememberBoot, shouldBoot } from "./introGate";

// The logo on the splash finishes drawing at ~1.1s; hold until then so a
// fast load still shows the whole animation instead of a flicker.
const SPLASH_MIN_MS = 1150;

/* The loading splash itself is plain HTML in index.html (#splash), so it
   is on screen from the first frame. This dissolves it once the site is
   ready, or hands straight over to the boot screen on a first visit. */
function dismissSplash({ instant = false } = {}) {
  const splash = document.getElementById("splash");
  if (!splash) return;
  if (instant) {
    splash.remove();
    return;
  }
  splash.classList.add("splash--out");
  window.setTimeout(() => splash.remove(), 900);
}

function AppLoader({ children }) {
  // First visit: terminal boot screen. Returning visitors: the splash.
  const [boot] = useState(shouldBoot);
  const [booting, setBooting] = useState(boot);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (boot) {
      // The boot screen is painted by now (effects run after paint).
      dismissSplash({ instant: true });
      return undefined;
    }
    // Don't wait for window.load (all images); the DOM is ready by now.
    const wait = Math.max(150, SPLASH_MIN_MS - performance.now());
    const id = window.setTimeout(() => {
      dismissSplash();
      setLoaded(true);
      markIntroReady();
    }, wait);
    return () => window.clearTimeout(id);
  }, [boot]);

  const enter = () => {
    rememberBoot();
    setBooting(false);
    setLoaded(true);
    // Let the boot screen start dissolving before the hero animates in.
    window.setTimeout(markIntroReady, 250);
  };

  return (
    <>
      <AnimatePresence>{booting && <BootScreen key="boot" onEnter={enter} />}</AnimatePresence>

      <div
        // The site renders underneath (so it's ready the moment it's
        // revealed) but stays invisible until then. Invisible also means its
        // first-layout settling never counts as a layout shift.
        className={`transition-opacity duration-700 ${
          loaded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={booting || undefined}
      >
        {children}
      </div>
    </>
  );
}

export default AppLoader;
