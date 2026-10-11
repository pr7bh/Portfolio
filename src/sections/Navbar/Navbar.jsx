import React, { useEffect, useState } from "react";
import GlassSurface from "../../common/GlassSurface";

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
      <nav className="fixed left-1/2 top-3 z-[1000] hidden -translate-x-1/2 px-3 md:block">
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
          <div className="relative flex h-[70px] items-center justify-center px-7 ">
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
            h-[2px]
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
      </nav>

      {/* ================= MOBILE NAVBAR ================= */}
      <nav className="fixed left-4 top-4 z-[1100] md:hidden">
        <GlassSurface
          width={56}
          height={56}
          borderRadius={18}
          displace={0.3}
          distortionScale={-100}
          redOffset={0}
          greenOffset={5}
          blueOffset={10}
          brightness={50}
          opacity={0.85}
          mixBlendMode="normal"
        >
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            className="
              flex
              h-[56px]
              w-[56px]
              items-center
              justify-center
            "
          >
            <span className="relative flex h-5 w-6 flex-col justify-between">
              <span
                className={`
                  block
                  h-[2px]
                  w-6
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ${isOpen ? "absolute top-1/2 rotate-45" : ""}
                `}
              />

              <span
                className={`
                  block
                  h-[2px]
                  w-6
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ${isOpen ? "opacity-0" : ""}
                `}
              />

              <span
                className={`
                  block
                  h-[2px]
                  w-6
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ${isOpen ? "absolute top-1/2 -rotate-45" : ""}
                `}
              />
            </span>
          </button>
        </GlassSurface>
      </nav>
      {/* ================= MOBILE CALL BUTTON ================= */}
      <nav className="fixed right-4 top-4 z-[1100] md:hidden">
        <GlassSurface
          width={56}
          height={56}
          borderRadius={18}
          displace={0.3}
          distortionScale={-100}
          redOffset={0}
          greenOffset={5}
          blueOffset={10}
          brightness={50}
          opacity={0.85}
          mixBlendMode="normal"
        >
          <a
            href="tel:+917056952556"
            aria-label="Call Prabhjot Singh"
            className="
        flex
        h-[56px]
        w-[56px]
        items-center
        justify-center
        text-white
        transition-transform
        duration-300
        active:scale-90
      "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.968-.852-1.09l-4.372-.995a1.125 1.125 0 0 0-1.173.417l-.96 1.172a1.125 1.125 0 0 1-1.218.36 12.035 12.035 0 0 1-7.49-7.49 1.125 1.125 0 0 1 .36-1.218l1.172-.96c.343-.281.498-.734.417-1.173L6.638 2.782A1.125 1.125 0 0 0 5.548 1.93H4.5A2.25 2.25 0 0 0 2.25 4.18v2.57Z"
              />
            </svg>
          </a>
        </GlassSurface>
      </nav>

      {/* ================= FULL SCREEN MOBILE MENU ================= */}
      <div
        className={`
          fixed
          inset-0
          z-[1050]
          md:hidden
          transition-all
          duration-500
          ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        {/* Glass background */}
        <div
          className={`
            absolute
            inset-3
            overflow-hidden
            rounded-[20px]
            border
            border-white/20
            bg-black/40
            backdrop-blur-2xl
            transition-transform
            duration-500
            ${isOpen ? "scale-100" : "scale-95"}
          `}
        >
          {/* Subtle glass highlights */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/[0.06] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl" />

          {/* Navigation */}
          <div className="relative flex h-full flex-col items-center justify-center px-8 ">
            <ul className="flex flex-col items-center gap-7">
              {navItems.map((item, index) => (
                <li
                  key={item.id}
                  className={`
                    transition-all
                    duration-500
                    ${
                      isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: isOpen ? `${index * 70}ms` : "0ms",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="
                      group
                      relative
                      cursor-pointer
                      bg-transparent
                      px-4
                      py-2
                      text-3xl
                      font-semibold
                      tracking-tight
                      text-white
                      transition-all
                      duration-300
                      hover:scale-105
                      hover:text-white/70
                    "
                  >
                    {item.label}

                    <span
                      className={`
                        absolute
                        bottom-0
                        left-1/2
                        h-[2px]
                        -translate-x-1/2
                        rounded-full
                        bg-white
                        transition-all
                        duration-300
                        ${activeSection === item.id ? "w-3/4" : "w-0"}
                        group-hover:w-3/4
                      `}
                    />
                  </button>
                </li>
              ))}
            </ul>

            {/* Bottom text */}
            <p
              className={`
                absolute
                bottom-10
                text-xs
                tracking-[0.3em]
                text-white/40
                uppercase
                transition-all
                duration-700
                ${
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }
              `}
            >
              Prabhjot Singh
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
