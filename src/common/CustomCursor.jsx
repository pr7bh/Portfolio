import { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

function CustomCursor() {
  const cursorRef = useRef(null);
  const [cursorType, setCursorType] = useState("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleMediaChange = (e) => {
      setIsDesktop(e.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const moveCursor = (event) => {
      const cursor = cursorRef.current;

      if (!cursor) return;

      cursor.style.left = `${event.clientX - 5}px`;
      cursor.style.top = `${event.clientY - 5}px`;

      setIsVisible(true);

      const target = event.target;

      const actionElement = target.closest?.(
        ".custom-cursor--action"
      );

      const closeElement = target.closest?.(
        ".custom-cursor--close"
      );

      if (closeElement) {
        setCursorType("close");
      } else if (actionElement) {
        setCursorType("action");
      } else {
        setCursorType("default");
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    document.addEventListener("mousemove", moveCursor);
    document.documentElement.addEventListener(
      "mouseleave",
      handleMouseLeave
    );
    document.documentElement.addEventListener(
      "mouseenter",
      handleMouseEnter
    );

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <svg
      ref={cursorRef}
      id="svg-cursor"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      className={`svg-cursor svg-cursor--${cursorType}`}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
      aria-hidden="true"
    >
      <g
        className="svg-cursor__lines"
        strokeWidth="2"
        stroke="currentColor"
      >
        <line
          x1="0"
          y1="10"
          x2="20"
          y2="10"
        />

        <line
          x1="0"
          y1="10"
          x2="20"
          y2="10"
        />

        <line
          x1="0"
          y1="10"
          x2="20"
          y2="10"
        />
      </g>
    </svg>
  );
}

export default CustomCursor;