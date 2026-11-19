import { motion } from "motion/react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="relative w-full overflow-hidden px-5 pt-10 md:px-10">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="select-none whitespace-nowrap text-center font-bold leading-[0.85]"
        style={{
          fontSize: "clamp(2.4rem, 11vw, 12rem)",
          letterSpacing: "-0.055em",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,0.14)",
          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent 75%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
      >
        PRABHJOT SINGH
      </motion.div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-[0.68rem] uppercase tracking-[0.2em] text-white/40 md:flex-row" style={{ fontFamily: "var(--font-mono)" }}>
        <span>&copy; {currentYear} Prabhjot Singh. All rights reserved.</span>
        <span>Built with React, WebGL &amp; Motion</span>
      </div>
    </footer>
  );
}

export default Footer;
