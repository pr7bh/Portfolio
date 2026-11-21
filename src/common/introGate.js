import { useSyncExternalStore } from "react";

/* Signals when the loader / boot screen has gone, so entrance animations
   (like the hero title) play when they can actually be seen. */
let ready = false;
const listeners = new Set();

export function markIntroReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((fn) => fn());
}

export function useIntroReady() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => ready,
    () => false
  );
}

const SEEN_KEY = "boot-seen";

/** First-visit boot screen: skipped for returning visitors and bots. */
export function shouldBoot() {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).has("boot")) return true;
  if (/bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp/i.test(navigator.userAgent)) {
    return false;
  }
  try {
    return localStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return false;
  }
}

export function rememberBoot() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode */
  }
}
