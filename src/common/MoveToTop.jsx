import { useEffect, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";
import GlassSurface from "./GlassSurface";

function MoveToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 1300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const moveToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`
        fixed
        bottom-6
        left-4
        z-[999]
        transition-all
        duration-500
        ease-out
        md:bottom-8
        md:left-8
        ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-8 scale-75 opacity-0"
        }
      `}
    >
      <button
        type="button"
        onClick={moveToTop}
        aria-label="Move to top"
        data-magnetic="0.35"
        className="custom-cursor--action group"
      >
        <GlassSurface
          width={54}
          height={54}
          borderRadius={18}
          brightness={35}
          opacity={0.7}
          blur={10}
          backgroundOpacity={0.12}
          saturation={1.2}
          distortionScale={-180}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          className="
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:-translate-y-1
          "
        >
          <div className="flex h-full w-full items-center justify-center">
            <IconArrowUp
              size={23}
              stroke={1.8}
              className="
                text-white
                transition-transform
                duration-300
                group-hover:-translate-y-1
              "
            />
          </div>
        </GlassSurface>
      </button>
    </div>
  );
}

export default MoveToTop;