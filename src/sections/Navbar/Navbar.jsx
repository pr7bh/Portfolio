import { useEffect, useState } from "react";
import GlassSurface from "../../common/GlassSurface";
import { motion, AnimatePresence } from "motion/react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navItems = [
    { label: "Experience", id: "experience" },
    { label: "Projects", id: "projects" },
    { label: "Skills", id: "skills" },
    { label: "Education", id: "education" },
    { label: "Contact", id: "contact" },
  ];

  useEffect(() => {
  const handleScroll = () => {
    const scrollPosition = window.scrollY + 150;

    let currentSection = "";

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);

      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionBottom
      ) {
        currentSection = item.id;
      }
    });

    setActiveSection(currentSection);
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }

    setIsOpen(false);
  };

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        className="fixed left-1/2 top-3 z-1000 hidden -translate-x-1/2 px-3 md:block"
      >
        <GlassSurface
          width={650}
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
          <div className="relative flex h-17.5 items-center justify-center px-7 ">
            <ul className="flex items-center gap-10">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="
          group
          relative
          cursor-pointer
          bg-transparent
          px-1
          py-2
          text-base
          font-medium
          text-white
        "
                  >
                    <span className="relative z-10">{item.label}</span>

                    <span
                      className={`
            pointer-events-none
            absolute
            bottom-0
            left-0
            h-0.5
            w-full
            origin-center
            scale-x-0
            rounded-full
            bg-white
            transition-transform
            duration-300
            ease-out
            group-hover:scale-x-100
            ${activeSection === item.id ? "scale-x-100" : ""}
          `}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </GlassSurface>
      </motion.nav>

      {/* ================= MOBILE PILL NAVBAR ================= */}
      <nav className="fixed left-1/2 top-3 z-1100 -translate-x-1/2 md:hidden">
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/35 px-4 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.35)]" style={{ height: 52 }}>

          {/* Hamburger */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            className="flex h-8 w-8 flex-col items-center justify-center gap-1.5"
          >
            <span className={`block h-px w-5 rounded-full bg-white transition-all duration-300 ${isOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 rounded-full bg-white transition-all duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 rounded-full bg-white transition-all duration-300 ${isOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-white/20" />

          {/* Name */}
          <span style={{ fontFamily: "'Nippo', sans-serif", letterSpacing: "0.12em" }} className="text-xs font-medium uppercase text-white/85">
            Prabhjot Singh
          </span>

          {/* Divider */}
          <div className="h-4 w-px bg-white/20" />

          {/* Call */}
          <a
            href="tel:+917056952556"
            aria-label="Call Prabhjot Singh"
            className="flex h-8 w-8 items-center justify-center text-white/80 transition-opacity active:opacity-60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </nav>

      {/* ================= FULL SCREEN MOBILE MENU ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-1050 md:hidden pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-hidden border-0 bg-black/55 backdrop-blur-2xl"
            >
              {/* Ambient glows */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/4 blur-3xl" />

              {/* Nav items */}
              <div className="relative flex h-full flex-col items-start justify-center px-10">
                <ul className="flex flex-col gap-1 w-full">
                  {navItems.map((item, index) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                    >
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className="group flex w-full items-center gap-5 py-3 text-left"
                      >
                        <span
                          style={{ fontFamily: "'Nippo', sans-serif", letterSpacing: "0.08em" }}
                          className="w-7 text-xs text-white/25 transition-colors duration-200 group-hover:text-white/50"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          style={{ fontFamily: "'Nippo', sans-serif", letterSpacing: "-0.02em" }}
                          className={`text-4xl font-bold transition-all duration-200 ${
                            activeSection === item.id
                              ? "text-white"
                              : "text-white/60 group-hover:text-white"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                      {index < navItems.length - 1 && (
                        <div className="ml-12 h-px bg-white/6" />
                      )}
                    </motion.li>
                  ))}
                </ul>

                {/* Footer */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="absolute bottom-10 left-10 text-[0.6rem] uppercase tracking-[0.3em] text-white/25"
                  style={{ fontFamily: "'Nippo', sans-serif" }}
                >
                  Portfolio · 2024
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
