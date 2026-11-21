import { useSyncExternalStore } from "react";

/* Installable app support: registers the service worker (production
   only) and keeps the browser's install prompt for when the visitor
   asks for it. */

let deferred = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true
  );
}

export function canInstall() {
  return Boolean(deferred);
}

/** Shows the browser's install dialog. Resolves to "accepted",
    "dismissed", "installed" or "unavailable". */
export async function promptInstall() {
  if (isStandalone()) return "installed";
  if (!deferred) return "unavailable";
  const prompt = deferred;
  deferred = null;
  emit();
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome;
}

export function useCanInstall() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    canInstall,
    () => false
  );
}

export function registerPWA() {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we offer it ourselves instead of the mini-infobar
    deferred = e;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });

  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is a bonus; the site works without it */
    });
  });
}
