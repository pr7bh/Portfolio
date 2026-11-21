/* One place for facts that several features read: the terminal, the
   availability badge and the boot screen. */

export const PROFILE = {
  name: "Prabhjot Singh",
  title: "Full Stack · GenAI Developer",
  location: "Yamunanagar, Haryana, IN",
  github: "https://github.com/pr7bh",
  linkedin: "https://www.linkedin.com/in/prabhjot-singh-40301b243/",
  phone: "+91 70569 52556",
  phoneHref: "tel:+917056952556",
};

/* ── Availability ────────────────────────────────────────────────
   `open`      shows the green "Open to roles" badge (false hides it).
   `bookingUrl` a Cal.com / Calendly link. While it's empty, "Book a
               call" takes people to the contact form with a call
               request already written for them. */
export const AVAILABILITY = {
  open: true,
  status: "Open to roles",
  detail: "Full-time · Remote or on-site",
  reply: "Replies in ~24h",
  bookingUrl: "",
};

export const EXPERIENCE = [
  { when: "Apr 2025 – Sep 2026", role: "Software Developer", company: "Open Access Technology International", note: "Geospatial maps & energy analytics in React · rated E1" },
  { when: "Dec 2024 – Apr 2025", role: "Software Engineer", company: "Carvia Technologies", note: "TrackIt issue tracker · Watchdog monitoring dashboard" },
  { when: "Sep 2024 – Nov 2024", role: "Freelance Full Stack Developer", company: "Self-employed", note: "Form builder · booking platform with admin dashboard" },
];

export const PROJECTS = [
  { slug: "geomind", title: "GeoMind AI", about: "Geospatial AI platform · LLM · Maps", url: "https://geo-mind-by-prabh.vercel.app/" },
  { slug: "syncora", title: "Syncora", about: "GenAI meeting assistant · RAG · Gemini", url: "https://syncora-by-prabh.vercel.app/" },
  { slug: "real-estate", title: "Real Estate", about: "Property discovery and search", url: "https://singh-estate.vercel.app/" },
  { slug: "netflix", title: "Netflix Clone", about: "Streaming platform UI", url: "https://netflix-by-prabh.vercel.app/" },
  { slug: "cryptoverse", title: "Cryptoverse", about: "Cryptocurrency tracker", url: "https://cryptoverse7.vercel.app/" },
  { slug: "shop", title: "Shopping Cart", about: "E-commerce shopping app", url: "https://shop-by-prabh.vercel.app/" },
];

export const SKILLS = {
  frontend: ["React", "Redux", "HTML", "CSS", "Tailwind"],
  backend: ["Node.js", "FastAPI"],
  genai: ["LLMs", "RAG", "Gemini"],
  data: ["MongoDB", "MySQL"],
  languages: ["JavaScript", "Python", "Java", "C / C++"],
  tools: ["Git"],
};

export const EDUCATION = [
  { when: "2020 – 2024", what: "B.Tech, Computer Science", where: "Chandigarh Group of Colleges", score: "86.3%" },
];

export const SECTIONS = ["hero", "experience", "projects", "skills", "education", "contact"];

/** Scroll to the contact form and, optionally, start the message for them. */
export function goToContact(message = "") {
  const section = document.getElementById("contact");
  section?.scrollIntoView({ behavior: "smooth" });
  if (!message) return;
  window.dispatchEvent(new CustomEvent("contact:prefill", { detail: { message } }));
}

export const CALL_REQUEST =
  "Hi Prabhjot, I'd like to schedule a quick call about a role / project. A few times that work for me:\n- ";

/** Open the hidden terminal, optionally running a command. */
export function openTerminal(command) {
  window.dispatchEvent(new CustomEvent("terminal:open", { detail: { command } }));
}
