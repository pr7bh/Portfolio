import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1];

const letter = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 0.9, ease } },
};

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

function SectionHeading({ index, kicker, title }) {
  return (
    <motion.header
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      className="mb-16 flex w-full flex-col items-center px-5 text-center md:mb-24"
    >
      <motion.div
        variants={fade}
        className="meta mb-6 flex items-center gap-3 text-white/40"
      >
        <span style={{ color: "var(--warm)" }}>{index}</span>
        <motion.span
          aria-hidden="true"
          className="block h-px w-10 origin-left bg-white/25"
          variants={{
            hidden: { scaleX: 0 },
            show: { scaleX: 1, transition: { duration: 0.9, ease, delay: 0.2 } },
          }}
        />
        <span>{kicker}</span>
      </motion.div>

      <h2
        aria-label={title}
        style={{
          fontSize: "clamp(2.75rem, 8.5vw, 7.5rem)",
          lineHeight: 0.9,
          letterSpacing: "-0.045em",
          fontWeight: 700,
        }}
      >
        <motion.span
          aria-hidden="true"
          className="inline-flex overflow-hidden pb-[0.08em]"
          variants={{ show: { transition: { staggerChildren: 0.035 } } }}
        >
          {[...title].map((ch, i) => (
            <motion.span key={i} variants={letter} className="inline-block">
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.span>
      </h2>
    </motion.header>
  );
}

export default SectionHeading;
