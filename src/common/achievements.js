import { useSyncExternalStore } from "react";
import { playSfx } from "./uiSounds";

/* Hidden achievements: small rewards for exploring the site's secrets.
   Progress is kept per browser in localStorage. */

export const BADGES = [
  { id: "terminal", title: "Root Access", desc: "Opened the hidden terminal.", hint: "Some keys open more than they should." },
  { id: "dj", title: "Sound Check", desc: "Turned on the ambient score.", hint: "This site has a soundtrack." },
  { id: "explorer", title: "Explorer", desc: "Visited every section.", hint: "See it all, top to bottom." },
  { id: "secret", title: "Hire Signal", desc: "Found the secret word.", hint: "Type what every recruiter wants to do." },
  { id: "hyperdrive", title: "Hyperdrive", desc: "Engaged the warp drive.", hint: "↑↑↓↓←→←→… you know the rest." },
  { id: "curator", title: "Curator", desc: "Opened three case studies.", hint: "Go deep on the projects." },
  { id: "oracle", title: "Oracle", desc: "Asked the AI a question.", hint: "Someone is waiting to chat." },
  { id: "nightowl", title: "Night Owl", desc: "Visited between midnight and 5 am.", hint: "Come back when the city sleeps." },
  { id: "completionist", title: "Completionist", desc: "Unlocked every other badge.", hint: "Collect them all." },
];

const KEY = "achievements";
const listeners = new Set();
const toastListeners = new Set();

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
}

let unlocked = typeof window === "undefined" ? {} : read();
let snapshot = Object.keys(unlocked).length;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(unlocked));
  } catch {
    /* private mode: progress lasts this visit */
  }
}

export function isUnlocked(id) {
  return Boolean(unlocked[id]);
}

export function unlock(id) {
  const badge = BADGES.find((b) => b.id === id);
  if (!badge || unlocked[id]) return;
  unlocked = { ...unlocked, [id]: Date.now() };
  snapshot = Object.keys(unlocked).length;
  save();
  playSfx("achievement", { live: true });
  toastListeners.forEach((fn) => fn(badge));
  listeners.forEach((fn) => fn());

  const others = BADGES.filter((b) => b.id !== "completionist");
  if (id !== "completionist" && others.every((b) => unlocked[b.id])) {
    window.setTimeout(() => unlock("completionist"), 1800);
  }
}

export function onUnlock(fn) {
  toastListeners.add(fn);
  return () => toastListeners.delete(fn);
}

export function progress() {
  return { count: Object.keys(unlocked).length, total: BADGES.length };
}

export function useAchievementCount() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => snapshot,
    () => 0
  );
}
