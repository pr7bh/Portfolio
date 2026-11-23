import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { playSfx } from "./uiSounds";
import { unlock } from "./achievements";

const Terminal = lazy(() => import("./Terminal"));
const MatrixRain = lazy(() => import("./MatrixRain"));

const SECRET = "hire"; // typed anywhere on the page: runs `sudo hire-me`

const isTyping = (el) =>
  el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/* Hidden terminal: press T, ` / ~, or Ctrl+K / ⌘K anywhere (or type the
   secret word, which runs `sudo hire-me`). */
export default function TerminalLauncher() {
  // null | { command }. The installed app's "Open terminal" shortcut uses ?terminal.
  const [state, setState] = useState(() =>
    new URLSearchParams(window.location.search).has("terminal") ? { command: null } : null
  );

  const close = useCallback(() => setState(null), []);

  // `matrix` in the terminal: full-screen rain, then back to the terminal.
  const [matrix, setMatrix] = useState(false);
  const matrixOn = useRef(false);
  matrixOn.current = matrix;
  const endMatrix = useCallback(() => {
    setMatrix(false);
    // Reopen once the exit key is released, so it can't type into the input.
    window.setTimeout(() => setState({ command: null }), 250);
  }, []);
  useEffect(() => {
    const on = () => {
      setState(null);
      setMatrix(true);
    };
    window.addEventListener("fx:matrix", on);
    return () => window.removeEventListener("fx:matrix", on);
  }, []);

  useEffect(() => {
    if (state) unlock("terminal");
  }, [state]);

  useEffect(() => {
    let typed = "";
    const toggle = () => {
      playSfx("open");
      setState((s) => (s ? null : { command: null }));
    };
    const onKey = (e) => {
      if (matrixOn.current) return; // keys exit the rain instead
      // Keys on the boot screen belong to it ("press any key to enter").
      if (document.querySelector('[data-boot-screen]')) return;
      // Ctrl+K / ⌘K toggles from anywhere, even while typing in the terminal.
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      // ` or ~ (by character, or by physical key for layouts where it's a
      // dead key), or T.
      if (e.key === "`" || e.key === "~" || e.code === "Backquote" || e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-SECRET.length);
      if (typed === SECRET) {
        typed = "";
        unlock("secret");
        playSfx("open");
        setState({ command: "sudo hire-me" });
      }
    };
    const onOpen = (e) => setState({ command: e.detail?.command || null });
    window.addEventListener("keydown", onKey);
    window.addEventListener("terminal:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("terminal:open", onOpen);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <AnimatePresence>
        {state && (
          <Terminal key="terminal" initial={state.command} onClose={close} />
        )}
      </AnimatePresence>
      <AnimatePresence>{matrix && <MatrixRain key="matrix" onDone={endMatrix} />}</AnimatePresence>
    </Suspense>
  );
}
