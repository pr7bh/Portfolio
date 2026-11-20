import { useEffect, useRef, useState } from "react";
import {
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconFileText,
  IconPhone,
} from "@tabler/icons-react";
import GlassSurface from "../../common/GlassSurface";
import SoundToggle from "../../common/SoundToggle";
import { useActiveSection } from "../../common/hooks";
import { motion, AnimatePresence, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import CV from "../../assets/cv.pdf";

const navItems = [
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Education", id: "education" },
  { label: "Contact", id: "contact" },
];

const SECTION_IDS = ["hero", ...navItems.map((item) => item.id)];
const ease = [0.22, 1, 0.36, 1];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);
  const { scrollY } = useScroll();

  // Hide while reading downwards, reveal as soon as the visitor scrolls up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - (scrollY.getPrevious() ?? 0);
    if (y < 160) setHidden(false);
    else if (delta > 6) setHidden(true);
    else if (delta < -6) setHidden(false);
  });

  // While the mobile sheet is open the page scroll is locked, so the jump
  // waits until the sheet has closed and the lock is released.
  const pendingScroll = useRef(null);
  const scrollToSection = (id) => {
    if (isOpen) {
      pendingScroll.current = id;
      setIsOpen(false);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen || !pendingScroll.current) return;
    const id = pendingScroll.current;
    pendingScroll.current = null;
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  }, [isOpen]);

  const concealed = hidden && !isOpen;

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <motion.nav
        aria-label="Primary"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: concealed ? 0 : 1, y: concealed ? -110 : 0 }}
        transition={{ duration: 0.5, ease }}
        className="fixed left-1/2 top-3 z-1000 hidden -translate-x-1/2 px-3 md:block"
      >
        <GlassSurface
          width={730}
          height={70}
          borderRadius={20}
          displace={0.3}
          distortionScale={-100}
          redOffset={0}
          greenOffset={5}
          blueOffset={10}
          brightness={50}
          opacity={0.85}
          mixBlendMode="normal"
        >
          <div className="relative flex h-17.5 items-center justify-center px-7">
            <ul className="flex items-center gap-10">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`group relative cursor-pointer bg-transparent px-1 py-2 text-base font-medium transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/70 hover:text-white"
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {isActive ? (
                        <motion.span
                          layoutId="nav-underline"
                          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full rounded-full"
                          style={{ background: "linear-gradient(90deg, var(--cool), #fff, var(--warm))" }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      ) : (
                        <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-center scale-x-0 rounded-full bg-white/60 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <span className="mx-7 h-5 w-px bg-white/15" aria-hidden="true" />
            <SoundToggle className="h-10 rounded-xl px-2 text-white/70 hover:text-white" />
          </div>
        </GlassSurface>
      </motion.nav>

      <MobileNav
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        concealed={concealed}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />
    </>
  );
};

/* ===================================================================
   MOBILE — a floating "signal" bar that reads out the current section
   and scroll progress, opening into a full-screen index sheet.
   =================================================================== */

const QUICK_LINKS = [
  { label: "GitHub", href: "https://github.com/pr7bh", Icon: IconBrandGithub, external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/prabhjot-singh-40301b243/", Icon: IconBrandLinkedin, external: true },
  { label: "CV", href: CV, Icon: IconFileText, external: true },
  { label: "Call", href: "tel:+917056952556", Icon: IconPhone, external: false },
];

const ALL_SECTIONS = [{ label: "Home", id: "hero" }, ...navItems];

function MobileNav({ isOpen, setIsOpen, concealed, activeSection, scrollToSection }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  const activeIndex = Math.max(0, ALL_SECTIONS.findIndex((s) => s.id === activeSection));
  const current = ALL_SECTIONS[activeIndex];

  // Lock page scroll and allow Escape while the sheet is open.
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* ---------- Floating bar ---------- */}
      <motion.nav
        aria-label="Primary"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: concealed ? 0 : 1, y: concealed ? -96 : 0 }}
        transition={{ duration: 0.45, ease }}
        className={`fixed inset-x-3 top-3 md:hidden ${isOpen ? "z-10006" : "z-1100"}`}
      >
        <div className="relative mx-auto flex h-14 max-w-md items-center gap-3 overflow-hidden rounded-2xl border border-white/12 bg-[rgba(8,8,10,0.62)] pl-1.5 pr-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          {/* Monogram */}
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            aria-label="Back to top"
            data-sfx="nav"
            className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl"
          >
            <span
              aria-hidden="true"
              className="absolute -inset-1/2 opacity-80"
              style={{
                background: "conic-gradient(from 210deg, var(--cool), transparent 30%, var(--warm) 55%, transparent 80%, var(--cool))",
                animation: "spin 9s linear infinite",
              }}
            />
            <span className="absolute inset-px rounded-[11px] bg-[#0a0a0c]" aria-hidden="true" />
            <span className="relative text-sm font-bold tracking-tight text-white">PS</span>
          </button>

          {/* Live section readout */}
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="meta flex items-center gap-1.5 text-[0.56rem]! tracking-[0.24em]! text-white/40">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-(--warm) opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-(--warm)" />
              </span>
              {String(activeIndex).padStart(2, "0")} / {String(ALL_SECTIONS.length - 1).padStart(2, "0")}
            </p>
            <div className="relative h-5 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={current.id}
                  initial={{ y: 18, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease }}
                  className="block truncate text-[0.95rem] font-medium leading-5 text-white"
                >
                  {current.id === "hero" ? "Prabhjot Singh" : current.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Ambient music */}
          <SoundToggle className="h-11 w-11 shrink-0 rounded-xl bg-white/[0.07] text-white active:bg-white/15" />

          {/* Menu toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className={`relative flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 transition-colors duration-300 ${
              isOpen ? "bg-white text-black" : "bg-white/[0.07] text-white active:bg-white/15"
            }`}
          >
            <span className="meta text-[0.6rem]! tracking-[0.2em]!">{isOpen ? "Close" : "Menu"}</span>
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span
                className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ${
                  isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0.5"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] rounded-full bg-current transition-all duration-300 ${
                  isOpen ? "top-1/2 w-full -translate-y-1/2 -rotate-45" : "bottom-0.5 w-2/3"
                }`}
              />
            </span>
          </button>

          {/* Scroll progress */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left"
            style={{ scaleX: progress, background: "linear-gradient(90deg, var(--cool), #fff 50%, var(--warm))" }}
          />
        </div>
      </motion.nav>

      {/* ---------- Index sheet ---------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ clipPath: "inset(0 0 100% 0 round 0 0 32px 32px)" }}
            animate={{ clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)" }}
            exit={{ clipPath: "inset(0 0 100% 0 round 0 0 32px 32px)" }}
            transition={{ duration: 0.65, ease }}
            className="fixed inset-0 z-10005 flex flex-col overflow-hidden bg-[#060607] md:hidden"
          >
            {/* Atmosphere */}
            <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-[rgba(147,241,255,0.09)] blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[rgba(255,162,76,0.1)] blur-3xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(ellipse at 30% 40%, #000 20%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, #000 20%, transparent 75%)",
              }}
            />

            <div className="relative flex flex-1 flex-col px-6 pb-8 pt-24">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.25 }}
                className="meta mb-6 flex items-center gap-3 text-white/35"
              >
                <span className="h-px w-8 bg-white/25" />
                Index
              </motion.p>

              {/* Sections */}
              <ul className="flex flex-col">
                {navItems.map((item, index) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.6, delay: 0.18 + index * 0.06, ease }}
                      className="border-b border-white/[0.07]"
                    >
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        data-sfx="nav"
                        aria-current={isActive ? "true" : undefined}
                        className="group relative flex w-full items-center gap-4 py-4 text-left"
                      >
                        <span
                          className={`meta w-6 text-[0.62rem]! transition-colors ${
                            isActive ? "text-(--warm)" : "text-white/30"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`flex-1 text-[2.1rem] font-bold leading-none tracking-[-0.03em] transition-colors duration-200 ${
                            isActive ? "text-white" : "text-white/45 group-active:text-white"
                          }`}
                        >
                          {item.label}
                        </span>
                        {isActive ? (
                          <motion.span
                            layoutId="mobile-active"
                            className="flex items-center gap-2"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          >
                            <span className="meta text-[0.55rem]! text-(--warm)">Here</span>
                            <span className="h-2 w-2 rounded-full bg-(--warm) shadow-[0_0_12px_var(--warm)]" />
                          </motion.span>
                        ) : (
                          <IconArrowUpRight
                            size={20}
                            stroke={1.5}
                            className="text-white/25 transition-transform duration-300 group-active:translate-x-0.5 group-active:-translate-y-0.5"
                          />
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease }}
                className="mt-auto pt-8"
              >
                <p className="meta mb-3 text-white/35">Connect</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {QUICK_LINKS.map(({ label, href, Icon, external }) => (
                    <a
                      key={label}
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 text-white/80 transition-colors active:border-white/25 active:bg-white/10"
                    >
                      <Icon size={20} stroke={1.5} />
                      <span className="meta text-[0.55rem]! tracking-[0.16em]!">{label}</span>
                    </a>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="meta flex items-center gap-2 text-white/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--cool) shadow-[0_0_10px_var(--cool)]" />
                    Yamunanagar, IN
                  </p>
                  <p className="meta text-white/25">© {new Date().getFullYear()}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
