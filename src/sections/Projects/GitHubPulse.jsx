import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconBrandGithub, IconGitCommit } from "@tabler/icons-react";
import { PROFILE } from "../../common/profile";

const API_BASE = "https://portfolio-h5kk.onrender.com";
const ease = [0.22, 1, 0.36, 1];

const USER = "pr7bh";

const getJSON = (url, ms = 9000) => {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .finally(() => window.clearTimeout(timer));
};

/* Straight from the browser: a public contributions API (GitHub's own
   calendar page blocks cross-site requests) plus GitHub's events API. */
async function loadDirect() {
  const [cal, events] = await Promise.all([
    getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`),
    getJSON(`https://api.github.com/users/${USER}/events/public?per_page=30`).catch(() => []),
  ]);
  const days = (cal.contributions || []).map(({ date, count, level }) => ({ date, count, level }));
  if (!days.length) throw new Error("no calendar");
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const push = Array.isArray(events) ? events.find((e) => e.type === "PushEvent") : null;
  return {
    total: cal.total?.lastYear ?? days.reduce((n, d) => n + d.count, 0),
    last30: days.filter((d) => d.date >= since).reduce((n, d) => n + d.count, 0),
    days,
    lastPush: push ? { repo: push.repo.name.split("/").pop(), at: push.created_at } : null,
    fetchedAt: new Date().toISOString(),
  };
}

/* Direct first (fast, no server to wake); the portfolio backend, which
   scrapes and caches the same data, is the fallback. */
const loadPulse = () => loadDirect().catch(() => getJSON(`${API_BASE}/api/github`, 45000));

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function ago(iso) {
  const s = (new Date(iso).getTime() - Date.now()) / 1000;
  const steps = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];
  let v = s;
  for (const [n, unit] of steps) {
    if (Math.abs(v) < n) return rtf.format(Math.round(v), unit);
    v /= n;
  }
  return rtf.format(Math.round(v), "year");
}

const LEVEL_STYLE = [
  { background: "rgba(255,255,255,0.05)" },
  { background: "rgba(147,241,255,0.28)" },
  { background: "rgba(147,241,255,0.55)", boxShadow: "0 0 6px rgba(147,241,255,0.45)" },
  { background: "rgba(255,190,130,0.85)", boxShadow: "0 0 8px rgba(255,162,76,0.55)" },
  { background: "#ffa24c", boxShadow: "0 0 12px rgba(255,162,76,0.9)" },
];

/* Live GitHub activity: contribution heatmap + latest push, served (and
   cached) by the portfolio backend. Fetched only once it scrolls near. */
export default function GitHubPulse() {
  const ref = useRef(null);
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setState({ status: "loading" });
        const slow = window.setTimeout(() => !cancelled && setState((s) => (s.status === "loading" ? { status: "waking" } : s)), 3500);
        loadPulse()
          .then((data) => !cancelled && setState({ status: "ready", data }))
          .catch(() => !cancelled && setState({ status: "error" }))
          .finally(() => window.clearTimeout(slow));
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  const data = state.data;
  const weeks = useMemo(() => {
    if (!data?.days?.length) return [];
    const offset = new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay();
    const cols = [];
    data.days.forEach((d, i) => {
      const slot = offset + i;
      const c = Math.floor(slot / 7);
      (cols[c] ||= Array(7).fill(null))[slot % 7] = d;
    });
    return cols;
  }, [data]);

  const loading = state.status === "loading" || state.status === "waking" || state.status === "idle";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease }}
      className="relative mx-auto mt-16 w-full max-w-6xl px-5 md:mt-20 md:px-10"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[rgba(10,10,12,0.6)] p-5 backdrop-blur-md md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(500px circle at 85% 0%, rgba(255,162,76,0.08), transparent 60%), radial-gradient(500px circle at 0% 100%, rgba(147,241,255,0.07), transparent 60%)" }}
        />

        {/* Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className={`absolute inset-0 rounded-full bg-emerald-400/70 ${state.status === "ready" ? "animate-ping" : ""}`} />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
            </span>
            <span className="meta text-white/70">Live from GitHub</span>
          </div>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <IconBrandGithub size={16} stroke={1.6} /> @pr7bh
          </a>
        </div>

        {/* Stats */}
        <div className="relative mt-7 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <Stat label="Contributions · 12 mo" value={data?.total} loading={loading} />
          <Stat label="Last 30 days" value={data?.last30} loading={loading} />
          <Stat label="Active days · 12 mo" value={data ? data.days.filter((d) => d.count > 0).length : null} loading={loading} />
          <div>
            <div className="meta text-white/55">Last push</div>
            {data?.lastPush ? (
              <a
                href={`${PROFILE.github}/${data.lastPush.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 text-white/90 hover:text-white"
              >
                <IconGitCommit size={18} stroke={1.6} className="shrink-0 text-(--cool)" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{data.lastPush.repo}</span>
                  <span className="block text-xs text-white/55">{ago(data.lastPush.at)}</span>
                </span>
              </a>
            ) : (
              <div className={`mt-2 h-9 w-32 rounded-lg ${loading ? "pulse-skeleton" : ""}`} />
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div className="relative mt-8">
          {state.status === "error" ? (
            <p className="py-8 text-center text-sm text-white/55">
              GitHub is taking a breather.{" "}
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="text-(--cool) underline underline-offset-4">
                See the profile on GitHub →
              </a>
            </p>
          ) : (
            <div className="heatmap-scroll overflow-x-auto pb-2" dir="rtl">
              <div className="heatmap" dir="ltr" role="img" aria-label={data ? `${data.total} contributions in the last year` : "Loading contributions"}>
                {(weeks.length ? weeks : Array.from({ length: 53 }, () => Array(7).fill(null))).map((week, c) => (
                  <div key={c} className="heatmap__col">
                    {week.map((d, r) => (
                      <span
                        key={r}
                        className={`heatmap__cell ${weeks.length ? "heatmap__cell--in" : loading ? "pulse-skeleton" : ""}`}
                        style={{
                          ...(d ? LEVEL_STYLE[d.level] : { background: "transparent" }),
                          animationDelay: `${(c + r) * 12}ms`,
                        }}
                        title={d ? `${d.count} contribution${d.count === 1 ? "" : "s"} · ${d.date}` : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-[0.62rem] text-white/50" style={{ fontFamily: "var(--font-mono)" }}>
            <span>
              {state.status === "waking" ? "Fetching from GitHub…" : data ? `Updated ${ago(data.fetchedAt)}` : " "}
            </span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              Less
              {LEVEL_STYLE.map((st, i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-[3px]" style={st} />
              ))}
              More
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, loading }) {
  return (
    <div>
      <div className="meta text-white/55">{label}</div>
      {value != null ? (
        <div className="mt-2 text-3xl font-bold tracking-tight text-white tabular-nums">{value}</div>
      ) : (
        <div className={`mt-2 h-9 w-20 rounded-lg ${loading ? "pulse-skeleton" : ""}`} />
      )}
    </div>
  );
}
