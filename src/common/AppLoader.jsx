import { useEffect, useState } from "react";
import Loader from "./Loader";

function AppLoader({ children }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setLoaded(true);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);

      return () => {
        window.removeEventListener("load", handleLoad);
      };
    }
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