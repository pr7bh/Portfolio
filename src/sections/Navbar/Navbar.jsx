import React, { useState } from 'react';
import GlassSurface from '../../common/GlassSurface';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
      });
    }

    setIsOpen(false);
  };

  const navItems = [
    { label: 'Projects', id: 'projects' },
    { label: 'Skills', id: 'skills' },
    { label: 'Education', id: 'education' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="fixed left-1/2 top-3 z-[1000] -translate-x-1/2 px-3">
  <GlassSurface
    width={500}
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
    className=""
  >
    <div className="relative flex h-[70px] items-center justify-center px-7 font-['Rubik']">

      {/* Desktop Menu */}
      <ul className="hidden items-center gap-10 md:flex">
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
              {item.label}

              {/* Animated underline */}
              <span
                className="
                  absolute
                  bottom-0
                  left-1/2
                  h-[2px]
                  w-0
                  -translate-x-1/2
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ease-out
                  group-hover:w-full
                "
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Mobile Hamburger */}
      <button
        type="button"
        onClick={toggleMenu}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        className="
          flex
          h-8
          w-8
          flex-col
          items-center
          justify-center
          gap-[5px]
          md:hidden
        "
      >
        <span
          className={`
            h-[3px]
            w-[25px]
            rounded-full
            bg-white
            transition-all
            duration-300
            ${isOpen ? 'translate-y-[8px] rotate-45' : ''}
          `}
        />

        <span
          className={`
            h-[3px]
            w-[25px]
            rounded-full
            bg-white
            transition-all
            duration-300
            ${isOpen ? 'opacity-0' : ''}
          `}
        />

        <span
          className={`
            h-[3px]
            w-[25px]
            rounded-full
            bg-white
            transition-all
            duration-300
            ${isOpen ? '-translate-y-[8px] -rotate-45' : ''}
          `}
        />
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-[76px]
            w-[200px]
            rounded-2xl
            border
            border-white/20
            bg-black/80
            p-2
            shadow-[0_10px_30px_rgba(0,0,0,0.3)]
            backdrop-blur-md
            md:hidden
          "
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="
                w-full
                rounded-lg
                px-4
                py-3
                text-left
                text-base
                font-medium
                text-white
                transition-all
                duration-200
                hover:translate-x-1
                hover:bg-white/10
              "
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  </GlassSurface>
</nav>
  );
};

export default Navbar;