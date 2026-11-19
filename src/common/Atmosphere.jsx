import { motion, useScroll, useSpring } from "motion/react";
import { useActiveSection } from "./hooks";

const SECTIONS = ["hero", "experience", "projects", "skills", "education", "contact"];

// Two soft light sources (warm + cool) that drift to a new arrangement per
// section, so the page reads as one environment with changing lighting.
const LIGHTS = {
  hero: { warm: [-30, -30, 0], cool: [30, 30, 0] },
  experience: { warm: [-28, -18, 0.9], cool: [30, 26, 0.45] },
  projects: { warm: [26, 30, 0.4], cool: [-6, -26, 0.9] },
  skills: { warm: [-16, 10, 0.6], cool: [16, -10, 0.6] },
  education: { warm: [28, -20, 0.7], cool: [-28, 22, 0.4] },
  contact: { warm: [0, 34, 1], cool: [-24, -28, 0.5] },
};

const blob = (rgb) => ({
  width: "90vmax",
  height: "90vmax",
  left: "calc(50% - 45vmax)",
  top: "calc(50% - 45vmax)",
  background: `radial-gradient(closest-side, rgba(${rgb}, 0.085), transparent)`,
});

const transition = { duration: 2.4, ease: [0.45, 0, 0.2, 1] };

function Atmosphere() {
  const active = useActiveSection(SECTIONS);
  const lights = LIGHTS[active] ?? LIGHTS.hero;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={blob("255, 162, 76")}
          initial={false}
          animate={{ x: `${lights.warm[0]}vw`, y: `${lights.warm[1]}vh`, opacity: lights.warm[2] }}
          transition={transition}
        />
        <motion.div
          className="absolute rounded-full"
          style={blob("147, 241, 255")}
          initial={false}
          animate={{ x: `${lights.cool[0]}vw`, y: `${lights.cool[1]}vh`, opacity: lights.cool[2] }}
          transition={transition}
        />
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[1200] h-[2px] origin-left opacity-80"
        style={{
          scaleX: progress,
          background: "linear-gradient(90deg, var(--cool), #ffffff 50%, var(--warm))",
        }}
      />
    </>
  );
}

export default Atmosphere;
