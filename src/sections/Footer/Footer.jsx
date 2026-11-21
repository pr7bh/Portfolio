import { motion } from "motion/react";
import { IconTerminal2 } from "@tabler/icons-react";
import { openTerminal } from "../../common/profile";

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

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-[0.68rem] uppercase tracking-[0.2em] text-white/55 md:flex-row" style={{ fontFamily: "var(--font-mono)" }}>
        <span>&copy; {currentYear} Prabhjot Singh. All rights reserved.</span>
        <button
          type="button"
          data-sfx="open"
          data-magnetic="0.25"
          onClick={() => openTerminal()}
          className="group order-first inline-flex items-center gap-2 rounded-full border border-white/12 px-3.5 py-1.5 text-white/55 transition-colors hover:border-(--cool)/50 hover:text-white md:order-none"
        >
          <IconTerminal2 size={14} stroke={1.6} className="text-(--cool)" />
          <span>Open terminal</span>
          <kbd className="hidden rounded border border-white/15 px-1.5 text-[0.6rem] text-white/55 md:inline">
            {/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
        <span>Built with React, WebGL &amp; Motion</span>
      </div>
    </footer>
  );
}

export default Footer;
