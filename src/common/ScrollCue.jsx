import { useMediaQuery } from "./hooks";

/* Hero "scroll down" cue: a glass capsule with a glowing signal that
   travels down it, a label, and two chevrons cascading below. */
export default function ScrollCue() {
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <div className="scroll-cue inline-flex flex-col items-center gap-3" aria-hidden="true">
      <span className="scroll-cue__capsule">
        <span className="scroll-cue__dot" />
      </span>
      <span className="scroll-cue__label">{canHover ? "Scroll to explore" : "Swipe up to explore"}</span>
      <span className="scroll-cue__chevrons">
        <span />
        <span />
      </span>
    </div>
  );
}
