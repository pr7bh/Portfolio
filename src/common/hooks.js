import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Sections below the fold are lazy-loaded, so they may not exist on mount;
// a MutationObserver attaches to each one as it appears.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join(",");

  useEffect(() => {
    const list = key.split(",");
    const visible = new Map();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const current = list.find((id) => visible.get(id));
        if (current) setActive(current);
      },
      { rootMargin: "-45% 0px -54% 0px" }
    );

    const observed = new Set();
    const attach = () => {
      list.forEach((id) => {
        if (observed.has(id)) return;
        const el = document.getElementById(id);
        if (el) {
          io.observe(el);
          observed.add(id);
        }
      });
      return observed.size === list.length;
    };

    let mo = null;
    if (!attach()) {
      mo = new MutationObserver(() => {
        if (attach()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      io.disconnect();
      mo?.disconnect();
    };
  }, [key]);

  return active;
}
