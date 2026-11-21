import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconX } from "@tabler/icons-react";
import CV from "../assets/cv.pdf";
import { pause, play } from "./ambientAudio";
import { playSfx } from "./uiSounds";
import { isStandalone, promptInstall } from "./pwa";
import { engageHyperdrive } from "./hyperdrive";
import { BADGES, isUnlocked, progress, unlock } from "./achievements";
import { getMood } from "./fx";
import {
  AVAILABILITY,
  CALL_REQUEST,
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROJECTS,
  SECTIONS,
  SKILLS,
  goToContact,
} from "./profile";

const ease = [0.22, 1, 0.36, 1];
const PROMPT_USER = "guest@prabhjot";
const sleep = (ms) => new Promise((r) => window.setTimeout(r, ms));
const loadedAt = Date.now();

const BANNER = String.raw`
 ___  ___    _____ ___ ___ __  __
| _ \/ __|  |_   _| __| _ \  \/  |
|  _/\__ \    | | | _||   / |\/| |
|_|  |___/    |_| |___|_|_\_|  |_|`;

/* ── Small output helpers ────────────────────────────────────────── */
const Dim = ({ children }) => <span className="text-white/55">{children}</span>;
const Cool = ({ children }) => <span className="text-(--cool)">{children}</span>;
const Warm = ({ children }) => <span className="text-(--warm)">{children}</span>;
const Ok = ({ children }) => <span className="text-emerald-300">{children}</span>;

function Link({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-(--cool) underline decoration-(--cool)/30 underline-offset-4 hover:decoration-(--cool)"
    >
      {children}
    </a>
  );
}

function Table({ rows }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <span className="text-(--cool)">{k}</span>
          <span className="text-white/75">{v}</span>
        </div>
      ))}
    </div>
  );
}

function findProject(arg) {
  if (!arg) return null;
  const q = arg.toLowerCase();
  const n = Number(q);
  if (Number.isInteger(n) && n >= 1 && n <= PROJECTS.length) return PROJECTS[n - 1];
  return PROJECTS.find((p) => p.slug === q || p.title.toLowerCase().startsWith(q)) || null;
}

const SECTION_ALIASES = { home: "hero", top: "hero", exp: "experience", work: "projects", edu: "education" };
const resolveSection = (arg = "") => {
  const q = arg.toLowerCase().replace(/^[./~]+|\/$/g, "");
  const id = SECTION_ALIASES[q] || q;
  return SECTIONS.includes(id) ? id : null;
};

/* ── Commands ────────────────────────────────────────────────────────
   Each runs with ({ args, print, close, clear }). `print` appends a line
   of output, so a command can stream its output over time. */
const COMMANDS = {
  help: {
    about: "list commands",
    run: ({ print }) => {
      const rows = Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => [name + (c.usage ? ` ${c.usage}` : ""), c.about]);
      print(<Table rows={rows} />);
      print(<Dim>Tip: Tab completes, ↑/↓ for history, Esc or Ctrl+K closes. Open it any time with T or Ctrl+K / ⌘K. There are a few hidden commands too.</Dim>);
    },
  },
  whoami: {
    about: "who's behind this",
    run: ({ print }) => {
      print(
        <span>
          <Warm>{PROFILE.name}</Warm> — {PROFILE.title}
        </span>
      );
      print(
        <span className="text-white/70">
          2+ years building fast, data-heavy web apps for energy &amp; geospatial platforms, plus GenAI
          products with LLMs, RAG, FastAPI and Gemini. Based in {PROFILE.location}.
        </span>
      );
    },
  },
  experience: {
    about: "where I've worked",
    run: ({ print }) =>
      EXPERIENCE.forEach((e) =>
        print(
          <div>
            <Cool>{e.role}</Cool> <Dim>@</Dim> {e.company}
            <div className="text-white/55">
              {e.when} · {e.note}
            </div>
          </div>
        )
      ),
  },
  projects: {
    about: "selected work",
    run: ({ print }) => {
      PROJECTS.forEach((p, i) =>
        print(
          <span>
            <Dim>{String(i + 1).padStart(2, "0")}</Dim> <Cool>{p.title.padEnd(14, " ")}</Cool>
            <span className="text-white/60">{p.about}</span>
          </span>
        )
      );
      print(<Dim>Try: open syncora  ·  open 1</Dim>);
    },
  },
  open: {
    usage: "<project>",
    about: "launch a project",
    complete: () => PROJECTS.map((p) => p.slug),
    run: ({ args, print }) => {
      const p = findProject(args[0]);
      if (!p) return print(<Warm>open: which project? Try `projects` for the list.</Warm>, "err");
      print(
        <span>
          Launching <Cool>{p.title}</Cool> → <Link href={p.url}>{p.url.replace(/^https:\/\//, "")}</Link>
        </span>
      );
      window.open(p.url, "_blank", "noopener,noreferrer");
    },
  },
  skills: {
    about: "the stack",
    run: ({ print }) => print(<Table rows={Object.entries(SKILLS).map(([k, v]) => [k, v.join(" · ")])} />),
  },
  education: {
    about: "degrees",
    run: ({ print }) =>
      EDUCATION.forEach((e) =>
        print(
          <span>
            <Cool>{e.what}</Cool> · {e.where} <Dim>({e.when}, {e.score})</Dim>
          </span>
        )
      ),
  },
  contact: {
    about: "ways to reach me",
    run: ({ print }) => {
      print(
        <Table
          rows={[
            ["github", <Link key="g" href={PROFILE.github}>github.com/pr7bh</Link>],
            ["linkedin", <Link key="l" href={PROFILE.linkedin}>linkedin.com/in/prabhjot-singh</Link>],
            ["phone", <a key="p" href={PROFILE.phoneHref} className="text-(--cool)">{PROFILE.phone}</a>],
            ["message", <span key="m">type <Cool>message</Cool> to open the contact form</span>],
          ]}
        />
      );
    },
  },
  message: {
    about: "write to me",
    run: async ({ print, close }) => {
      print(<Dim>Opening the contact form…</Dim>);
      await sleep(350);
      close();
      goToContact();
      window.setTimeout(() => document.getElementById("name")?.focus({ preventScroll: true }), 800);
    },
  },
  book: {
    about: "book a call",
    run: async ({ print, close }) => {
      if (AVAILABILITY.bookingUrl) {
        print(<span>Calendar → <Link href={AVAILABILITY.bookingUrl}>{AVAILABILITY.bookingUrl}</Link></span>);
        window.open(AVAILABILITY.bookingUrl, "_blank", "noopener,noreferrer");
        return;
      }
      print(<Dim>Drafting a call request in the contact form…</Dim>);
      await sleep(350);
      close();
      goToContact(CALL_REQUEST);
    },
  },
  cv: {
    about: "open my résumé",
    run: ({ print }) => {
      print(<span>Opening <Cool>cv.pdf</Cool>…</span>);
      window.open(CV, "_blank", "noopener,noreferrer");
    },
  },
  ask: {
    usage: "<question>",
    about: "ask my AI assistant",
    run: async ({ args, print, close }) => {
      const question = args.join(" ").trim();
      if (!question) return print(<Warm>ask: what would you like to know? e.g. ask what is syncora</Warm>, "err");
      print(<Dim>Routing to the AI assistant…</Dim>);
      await sleep(300);
      close();
      window.dispatchEvent(new CustomEvent("ai:ask", { detail: { question } }));
    },
  },
  goto: {
    usage: "<section>",
    about: "jump to a section",
    complete: () => SECTIONS,
    run: async ({ args, print, close }) => {
      const id = resolveSection(args[0]);
      if (!id) return print(<Warm>goto: sections are {SECTIONS.join(", ")}</Warm>, "err");
      print(<Dim>cd /{id}</Dim>);
      await sleep(200);
      close();
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 250);
    },
  },
  music: {
    usage: "[on|off]",
    about: "background score",
    complete: () => ["on", "off"],
    run: ({ args, print }) => {
      const want = (args[0] || "").toLowerCase();
      if (want === "off") {
        pause();
        print(<span>Ambient score <Warm>muted</Warm>. Clicks still sound.</span>);
      } else {
        play();
        print(<span>Ambient score <Ok>playing</Ok> — A minor, generated live.</span>);
      }
    },
  },
  install: {
    about: "install as an app",
    run: async ({ print }) => {
      if (isStandalone()) return print(<Ok>Already running as an installed app.</Ok>);
      const result = await promptInstall();
      if (result === "accepted") return print(<Ok>Installed. Find it on your home screen / app list.</Ok>);
      if (result === "dismissed") return print(<Dim>No worries — run `install` any time.</Dim>);
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      print(
        iOS ? (
          <span>On iPhone/iPad: tap <Cool>Share</Cool> → <Cool>Add to Home Screen</Cool>.</span>
        ) : (
          <span>
            Your browser hasn&apos;t offered it yet — use the <Cool>install icon</Cool> in the address bar
            (Chrome / Edge), or <Cool>File → Add to Dock</Cool> in Safari.
          </span>
        )
      );
    },
  },
  warp: {
    about: "engage hyperdrive",
    run: async ({ print, close }) => {
      print(<span>Spooling warp core<Dim> ........ </Dim><Warm>engaged</Warm></span>);
      await sleep(450);
      close();
      window.setTimeout(engageHyperdrive, 250);
    },
  },
  badges: {
    about: "achievements you've unlocked",
    run: ({ print }) => {
      const { count, total } = progress();
      print(<span><Warm>{count}/{total}</Warm> unlocked</span>);
      print(
        <Table
          rows={BADGES.map((b) => [
            isUnlocked(b.id) ? `✓ ${b.title}` : "· ???",
            isUnlocked(b.id) ? b.desc : <Dim key={b.id}>Hint: {b.hint}</Dim>,
          ])}
        />
      );
    },
  },
  neofetch: {
    about: "system info",
    run: ({ print }) => {
      const mins = Math.max(1, Math.round((Date.now() - loadedAt) / 60000));
      print(
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <pre className="text-(--warm) leading-tight">{`  ▄▄▄▄   ▄▄▄▄
  █   █ █
  █▀▀▀   ▀▀▀█
  █     ▄▄▄▄▀`}</pre>
          <Table
            rows={[
              ["user", `${PROMPT_USER}`],
              ["os", "portfolio v26.11 (react 18)"],
              ["host", "vercel edge"],
              ["shell", "ps-term 1.0"],
              ["uptime", `${mins} min`],
              ["role", PROFILE.title],
              ["stack", "React · FastAPI · Node · Gemini"],
              ["status", AVAILABILITY.open ? AVAILABILITY.status : "Busy building"],
            ]}
          />
        </div>
      );
    },
  },
  ls: {
    about: "list files",
    run: ({ print }) =>
      print(
        <span>
          <Cool>experience/  projects/  skills/  education/  contact/</Cool>  cv.pdf  readme.md
        </span>
      ),
  },
  cat: {
    hidden: true,
    run: (ctx) => {
      const f = (ctx.args[0] || "").toLowerCase();
      if (f === "cv.pdf") return COMMANDS.cv.run(ctx);
      if (f === "readme.md" || f === "readme") return COMMANDS.whoami.run(ctx);
      return ctx.print(<Warm>cat: {f || "?"}: No such file. Try `ls`.</Warm>, "err");
    },
  },
  cd: { hidden: true, run: (ctx) => COMMANDS.goto.run(ctx) },
  clear: { about: "clear the screen", run: ({ clear }) => clear() },
  exit: { about: "close the terminal", run: ({ close }) => close() },
  sudo: {
    hidden: true,
    run: async ({ args, print, close }) => {
      if (args.join(" ").toLowerCase() === "hire-me") unlock("secret");
      if (args.join(" ").toLowerCase() !== "hire-me") {
        print(<Warm>{PROMPT_USER} is not in the sudoers file. This incident will be reported. (Try `sudo hire-me`.)</Warm>, "err");
        return;
      }
      print(<Dim>[sudo] password for guest: ••••••••</Dim>);
      await sleep(500);
      print(<Ok>Access granted.</Ok>);
      await sleep(350);
      for (const [label, value] of [
        ["Verifying skills", "React · FastAPI · GenAI"],
        ["Checking availability", AVAILABILITY.open ? AVAILABILITY.status.toLowerCase() : "ask me"],
        ["Preparing offer letter", "done"],
      ]) {
        print(<span>{label}<Dim> ........ </Dim><Cool>{value}</Cool></span>);
        await sleep(420);
      }
      print(<Warm>Opening a direct channel to Prabhjot →</Warm>);
      playSfx("confirm");
      await sleep(700);
      close();
      goToContact("Hi Prabhjot, I came across your portfolio and would love to talk to you about a role on our team.\n\nRole: \nCompany: ");
    },
  },
  hire: { hidden: true, run: (ctx) => COMMANDS.sudo.run({ ...ctx, args: ["hire-me"] }) },
  echo: { hidden: true, run: ({ args, print }) => print(<span>{args.join(" ")}</span>) },
  date: { hidden: true, run: ({ print }) => print(<span>{new Date().toString()}</span>) },
  pwd: { hidden: true, run: ({ print }) => print(<span>/home/guest/portfolio</span>) },
  rm: { hidden: true, run: ({ print }) => print(<Warm>rm: permission denied. This portfolio is load-bearing.</Warm>, "err") },
  coffee: { hidden: true, run: ({ print }) => print(<span>Brewing… <Warm>☕</Warm> Prabhjot runs on chai, actually.</span>) },
};

const ALIASES = { "?": "help", about: "whoami", exp: "experience", work: "projects", cls: "clear", quit: "exit", resume: "cv", sound: "music", email: "message", call: "book" };
const resolve = (name) => COMMANDS[name] ? name : ALIASES[name] || null;

const SUGGESTIONS = ["help", "whoami", "projects", "warp", "badges", "sudo hire-me", "neofetch"];

let nextId = 1;

export default function Terminal({ onClose, initial }) {
  const [lines, setLines] = useState(() => [
    { id: nextId++, kind: "sys", node: <pre className="text-(--cool) text-[0.55rem] leading-[1.15] sm:text-[0.7rem]">{BANNER}</pre> },
    { id: nextId++, kind: "sys", node: <span className="text-white/55">{getMood().greeting.split(" — ")[0]}, guest. Type <Cool>help</Cool> to see what this terminal can do.</span> },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const history = useRef([]);
  const histIndex = useRef(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const ranInitial = useRef(false);

  const print = useCallback((node, kind = "out") => {
    setLines((prev) => [...prev, { id: nextId++, kind, node }]);
  }, []);

  const run = useCallback(
    async (raw) => {
      const input = raw.trim();
      print(
        <span>
          <Ok>{PROMPT_USER}</Ok>
          <Dim>:~$</Dim> {input}
        </span>,
        "in"
      );
      if (!input) return;
      history.current = [input, ...history.current.filter((h) => h !== input)].slice(0, 50);
      histIndex.current = -1;

      const [first, ...args] = input.split(/\s+/);
      const name = resolve(first.toLowerCase());
      if (!name) {
        playSfx("error");
        print(<Warm>command not found: {first}. Type `help`.</Warm>, "err");
        return;
      }
      setBusy(true);
      try {
        await COMMANDS[name].run({
          args,
          print,
          close: onClose,
          clear: () => setLines([]),
        });
      } finally {
        setBusy(false);
      }
    },
    [print, onClose]
  );

  // Run a command passed in on open (e.g. the secret word runs hire-me).
  useEffect(() => {
    if (initial && !ranInitial.current) {
      ranInitial.current = true;
      run(initial);
    }
  }, [initial, run]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus({ preventScroll: true });
  }, [busy]);

  // Lock page scroll, close on Escape (even mid-command), and hand focus
  // back to wherever it was when the terminal closes.
  useEffect(() => {
    const returnTo = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (returnTo instanceof HTMLElement && returnTo.isConnected && !document.activeElement?.closest?.("form")) {
        returnTo.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  const complete = () => {
    const parts = value.split(/\s+/);
    if (parts.length === 1) {
      const matches = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(parts[0].toLowerCase()));
      if (matches.length === 1) setValue(matches[0] + " ");
      else if (matches.length > 1) print(<Dim>{matches.join("  ")}</Dim>);
      return;
    }
    const cmd = COMMANDS[resolve(parts[0].toLowerCase())];
    const options = cmd?.complete?.() || [];
    const last = parts[parts.length - 1].toLowerCase();
    const matches = options.filter((o) => o.startsWith(last));
    if (matches.length === 1) setValue([...parts.slice(0, -1), matches[0]].join(" "));
    else if (matches.length > 1) print(<Dim>{matches.join("  ")}</Dim>);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (busy) return;
      const v = value;
      setValue("");
      run(v);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(history.current.length - 1, histIndex.current + 1);
      if (i >= 0) {
        histIndex.current = i;
        setValue(history.current[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = histIndex.current - 1;
      histIndex.current = Math.max(-1, i);
      setValue(i >= 0 ? history.current[i] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key.length === 1) {
      playSfx("type");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-10020 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.45, ease }}
        className="relative flex h-[86dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/12 bg-[rgba(6,7,9,0.94)] shadow-[0_40px_140px_-20px_rgba(0,0,0,1),0_0_0_1px_rgba(147,241,255,0.05),0_0_80px_-30px_rgba(147,241,255,0.35)] md:h-[72vh] md:rounded-2xl"
        style={{ fontFamily: "var(--font-mono)" }}
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
      >
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
          </span>
          <span className="flex-1 text-center text-[0.68rem] tracking-[0.12em] text-white/55">
            {PROMPT_USER}: ~ — ps-term
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal"
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Output */}
        <div
          ref={scrollRef}
          className="terminal-scroll flex-1 space-y-1.5 overflow-y-auto px-4 py-4 text-[0.74rem] leading-relaxed text-white/85 md:px-6 md:text-[0.8rem]"
          aria-live="polite"
        >
          {lines.map((l) => (
            <div key={l.id} className={l.kind === "in" ? "pt-2" : ""}>
              {l.node}
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center gap-2 pt-2">
            <label htmlFor="terminal-input" className="shrink-0 whitespace-nowrap">
              <Ok>{PROMPT_USER}</Ok>
              <Dim>:~$</Dim>
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={busy}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              data-sfx="none"
              className="min-w-0 flex-1 bg-transparent text-white caret-(--cool) outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Quick commands (handy on phones) */}
        <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                run(s);
              }}
              className="shrink-0 rounded-full border border-white/12 px-3 py-1.5 text-[0.66rem] text-white/60 transition-colors hover:border-(--cool)/50 hover:text-white disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
