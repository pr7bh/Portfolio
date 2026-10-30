import { useEffect, useState } from "react";
import Loader from "./Loader";

function AppLoader({ children }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Don't block on window.load — it waits for all images (11MB+) which
    // causes 10-30s blank screen on mobile. Show content after DOM is ready.
    if (document.readyState !== "loading") {
      const id = setTimeout(() => setLoaded(true), 400);
      return () => clearTimeout(id);
    }

    const handleReady = () => {
      setTimeout(() => setLoaded(true), 400);
    };

    document.addEventListener("DOMContentLoaded", handleReady);
    return () => document.removeEventListener("DOMContentLoaded", handleReady);
  }, []);

  return (
    <>
      {!loaded && <Loader />}

      <div
        className={`
          transition-opacity
          duration-700
          ${
            loaded
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        {children}
      </div>
    </>
  );
}

export default AppLoader;