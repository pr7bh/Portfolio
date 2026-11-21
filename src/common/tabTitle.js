/* Tab-title trick: when the visitor switches tabs the title asks them to
   come back and the icon dims; on return it says welcome back, briefly. */

const AWAY = "👀 Come back… · Prabhjot Singh";
const BACK = "👋 Welcome back!";

export function installTabTitle() {
  if (typeof document === "undefined") return () => {};
  const original = document.title;
  const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  const iconHref = icon?.getAttribute("href");
  let restore = 0;
  let awayTimer = 0;

  const onVisibility = () => {
    window.clearTimeout(restore);
    window.clearTimeout(awayTimer);
    if (document.hidden) {
      // A short delay so quick tab flicks don't trigger it.
      awayTimer = window.setTimeout(() => {
        document.title = AWAY;
        icon?.setAttribute("href", "/favicon-dim.svg");
      }, 600);
    } else {
      icon?.setAttribute("href", iconHref);
      if (document.title === AWAY) {
        document.title = BACK;
        restore = window.setTimeout(() => (document.title = original), 2200);
      }
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.clearTimeout(restore);
    window.clearTimeout(awayTimer);
    document.title = original;
    icon?.setAttribute("href", iconHref);
  };
}
