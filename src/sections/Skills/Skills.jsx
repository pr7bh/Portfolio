import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import reactIcon from "../../assets/react.svg";
import tailwindIcon from "../../assets/tailwind.svg";
import fastapiIcon from "../../assets/FastAPI.svg";
import mongodbIcon from "../../assets/mongodb.svg";
import nodejsIcon from "../../assets/node-js.svg";
import htmlIcon from "../../assets/html.svg";
import cssIcon from "../../assets/css.svg";
import javascriptIcon from "../../assets/javascript.svg";
import javaIcon from "../../assets/java.svg";
import cppIcon from "../../assets/c-cpp.svg";
import pythonIcon from "../../assets/python.svg";
import reduxIcon from "../../assets/redux.svg";
import gitIcon from "../../assets/git.svg";
import mysqlIcon from "../../assets/mysql.svg";

import SectionHeading from "../../common/SectionHeading";
import Strands from "../../common/Strands";
import { useMediaQuery } from "../../common/hooks";

// x/y are percentages of the constellation plane; z is depth in px.
const CLUSTERS = [
  {
    id: "frontend",
    label: "Frontend",
    x: 17, y: 34, z: 50,
    skills: [
      { name: "React", src: reactIcon },
      { name: "Redux", src: reduxIcon },
      { name: "HTML", src: htmlIcon },
      { name: "CSS", src: cssIcon },
      { name: "Tailwind", src: tailwindIcon },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    x: 38, y: 19, z: -30,
    skills: [{ name: "Git", src: gitIcon }],
  },
  {
    id: "backend",
    label: "Backend",
    x: 72, y: 17, z: 20,
    skills: [
      { name: "Node.js", src: nodejsIcon },
      { name: "FastAPI", src: fastapiIcon },
    ],
  },
  {
    id: "ai",
    label: "AI / GenAI",
    x: 86, y: 50, z: 70,
    skills: [{ name: "LLMs" }, { name: "RAG" }, { name: "Gemini" }],
  },
  {
    id: "data",
    label: "Databases",
    x: 68, y: 82, z: -10,
    skills: [
      { name: "MongoDB", src: mongodbIcon },
      { name: "MySQL", src: mysqlIcon },
    ],
  },
  {
    id: "languages",
    label: "Languages",
    x: 24, y: 80, z: 30,
    skills: [
      { name: "JavaScript", src: javascriptIcon },
      { name: "Python", src: pythonIcon },
      { name: "Java", src: javaIcon },
      { name: "C / C++", src: cppIcon },
    ],
  },
];

const TOTAL = CLUSTERS.reduce((sum, c) => sum + c.skills.length, 0);
const ASPECT = 1.6;
const ORBIT = 96;
const ease = [0.22, 1, 0.36, 1];

// Fan each cluster's skills out on the side facing away from the core,
// so connection lines never cross a cluster's own nodes.
function satellites(cluster) {
  const n = cluster.skills.length;
  const outward = Math.atan2(cluster.y - 50, (cluster.x - 50) * ASPECT);
  const spread = n === 1 ? 0 : Math.min(Math.PI * 1.55, (n - 1) * 1.05);
  return cluster.skills.map((skill, i) => {
    const a = n === 1 ? outward : outward - spread / 2 + (i * spread) / (n - 1);
    return { ...skill, dx: Math.cos(a) * ORBIT, dy: Math.sin(a) * ORBIT };
  });
}

function SkillGlyph({ skill, size }) {
  return skill.src ? (
    <img src={skill.src} alt="" draggable={false} style={{ width: size, height: size }} className="object-contain" />
  ) : (
    <span className="text-[0.62rem] font-medium tracking-wide text-white/85" style={{ fontFamily: "var(--font-mono)" }}>
      {skill.name}
    </span>
  );
}

function Constellation() {
  const [active, setActive] = useState(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 60, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 60, damping: 18 });
  const activeCluster = CLUSTERS.find((c) => c.id === active);

  return (
    <div className="flex w-full flex-col items-center px-10">
      <div
        className="relative aspect-[16/10] w-full max-w-6xl"
        style={{ perspective: 1400 }}
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease }}
        >
          {/* Core → cluster links */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {CLUSTERS.map((c, i) => {
              const lerp = (t) => [50 + (c.x - 50) * t, 50 + (c.y - 50) * t];
              const [x1, y1] = lerp(0.24);
              const [x2, y2] = lerp(0.8);
              return (
                <g key={c.id}>
                  <motion.line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={1}
                    stroke="rgba(255,255,255,0.14)"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.3 + i * 0.12, ease }}
                  />
                  {active === c.id && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      vectorEffect="non-scaling-stroke"
                      strokeWidth={1.4}
                      strokeDasharray="4 4"
                      stroke="var(--warm)"
                      style={{ animation: "flow 0.9s linear infinite" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nucleus */}
          <div
            className="absolute left-1/2 top-1/2 flex flex-col items-center"
            style={{ transform: "translate(-50%, -50%) translateZ(0px)" }}
          >
            <div className="h-44 w-44">
              <Strands glass energy={active ? 0.9 : 0.55} interactive={false} maxDevicePixelRatio={1.5} />
            </div>
            <span className="meta -mt-3 text-white/45">{TOTAL} technologies</span>
          </div>

          {CLUSTERS.map((c, i) => {
            const on = active === c.id;
            const dimmed = active && !on;
            const sats = satellites(c);
            return (
              <div
                key={c.id}
                className="absolute"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  transform: `translateZ(${c.z}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="transition-opacity duration-500"
                  style={{
                    opacity: dimmed ? 0.22 : 1,
                    transformStyle: "preserve-3d",
                    animation: reduce ? undefined : `drift ${7 + i * 1.3}s ease-in-out ${-i * 1.7}s infinite`,
                  }}
                  onMouseEnter={() => setActive(c.id)}
                  onMouseLeave={() => setActive(null)}
                >
                  <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
                    {sats.map((s) => (
                      <line
                        key={s.name}
                        x1={s.dx * 0.12}
                        y1={s.dy * 0.12}
                        x2={s.dx * 0.7}
                        y2={s.dy * 0.7}
                        stroke={on ? "var(--warm)" : "rgba(255,255,255,0.12)"}
                        strokeWidth="1"
                        strokeDasharray={on ? "3 3" : "none"}
                        style={on ? { animation: "flow 0.7s linear infinite" } : undefined}
                      />
                    ))}
                  </svg>

                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${c.label}: ${c.skills.map((s) => s.name).join(", ")}`}
                    onFocus={() => setActive(c.id)}
                    onBlur={() => setActive(null)}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-full p-2"
                  >
                    <span
                      className="block h-3 w-3 rounded-full border transition-all duration-500"
                      style={{
                        borderColor: on ? "var(--warm)" : "rgba(255,255,255,0.5)",
                        background: on ? "var(--warm)" : "#050506",
                        boxShadow: on ? "0 0 20px rgba(255,162,76,0.7)" : "none",
                      }}
                    />
                    <span className="meta whitespace-nowrap text-white/70">{c.label}</span>
                  </button>

                  {sats.map((s, j) => (
                    <div
                      key={s.name}
                      className="absolute"
                      style={{ left: s.dx, top: s.dy, transform: "translate(-50%, -50%) translateZ(34px)" }}
                    >
                      <motion.div
                        className="flex h-14 w-14 items-center justify-center rounded-full border bg-[#0a0a0c]/90 transition-[border-color,box-shadow,scale] duration-500 hover:scale-110"
                        style={{
                          borderColor: on ? "rgba(255,162,76,0.55)" : "rgba(255,255,255,0.1)",
                          boxShadow: on ? "0 0 28px rgba(255,162,76,0.18)" : "0 10px 30px rgba(0,0,0,0.5)",
                        }}
                        initial={{ opacity: 0, scale: 0.4 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 + j * 0.06, ease }}
                      >
                        <SkillGlyph skill={s} size={28} />
                      </motion.div>
                      {s.src && (
                        <span
                          className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] text-white/80 transition-all duration-300"
                          style={{ opacity: on ? 1 : 0, transform: `translate(-50%, ${on ? 0 : -4}px)` }}
                        >
                          {s.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div aria-live="polite" className="mt-6 flex min-h-12 flex-col items-center gap-2 text-center">
        {activeCluster ? (
          <>
            <span className="meta" style={{ color: "var(--warm)" }}>
              {activeCluster.label}
            </span>
            <span className="text-sm text-white/70">{activeCluster.skills.map((s) => s.name).join("  ·  ")}</span>
          </>
        ) : (
          <span className="meta text-white/55">Hover or focus a cluster to explore</span>
        )}
      </div>
    </div>
  );
}

function Ring({ items, radius, duration, reverse, selected, reduce }) {
  const spin = reduce ? undefined : `${reverse ? "spinReverse" : "spin"} ${duration}s linear infinite`;
  const counter = reduce ? undefined : `${reverse ? "spin" : "spinReverse"} ${duration}s linear infinite`;
  return (
    <div className="absolute inset-0" style={{ animation: spin }}>
      {items.map((s, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const on = s.cluster === selected;
        return (
          <div
            key={s.name}
            className="absolute"
            style={{
              left: `${50 + Math.cos(a) * radius}%`,
              top: `${50 + Math.sin(a) * radius}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div style={{ animation: counter }}>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border bg-[#0a0a0c] transition-all duration-500"
                style={{
                  opacity: on ? 1 : 0.3,
                  transform: `scale(${on ? 1.12 : 0.88})`,
                  borderColor: on ? "rgba(255,162,76,0.6)" : "rgba(255,255,255,0.1)",
                  boxShadow: on ? "0 0 22px rgba(255,162,76,0.3)" : "none",
                }}
              >
                {s.src ? (
                  <img src={s.src} alt="" draggable={false} className="h-5.5 w-5.5 object-contain" />
                ) : (
                  <span className="text-[0.5rem] text-white/85" style={{ fontFamily: "var(--font-mono)" }}>
                    {s.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ALL_SKILLS = CLUSTERS.flatMap((c) => c.skills.map((s) => ({ ...s, cluster: c.id })));

function MobileUniverse() {
  const [selected, setSelected] = useState(CLUSTERS[0].id);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const cluster = CLUSTERS.find((c) => c.id === selected);
  const clusterIndex = CLUSTERS.indexOf(cluster);

  // Gently tour the clusters until the visitor picks one themselves.
  useEffect(() => {
    if (touched || reduce || !inView) return;
    const id = setInterval(() => {
      setSelected((current) => {
        const i = CLUSTERS.findIndex((c) => c.id === current);
        return CLUSTERS[(i + 1) % CLUSTERS.length].id;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [touched, reduce, inView]);

  return (
    <div ref={ref} className="flex w-full flex-col items-center">
      <motion.div
        className="relative aspect-square w-[min(88vw,380px)] overflow-hidden rounded-full"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease }}
      >
        <div aria-hidden="true" className="absolute inset-[4%] rounded-full border border-white/[0.07]" />
        <div aria-hidden="true" className="absolute inset-[24%] rounded-full border border-dashed border-white/[0.08]" />
        <div
          aria-hidden="true"
          className="absolute inset-[4%] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(147,241,255,0.06), transparent)" }}
        />

        <Ring items={ALL_SKILLS.slice(0, 10)} radius={40} duration={80} selected={selected} reduce={reduce} />
        <Ring items={ALL_SKILLS.slice(10)} radius={24} duration={55} reverse selected={selected} reduce={reduce} />

        <div className="absolute left-1/2 top-1/2 flex w-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="aspect-square w-full">
            <Strands glass energy={0.6} interactive={false} maxDevicePixelRatio={1.5} />
          </div>
        </div>
      </motion.div>

      <div className="meta mt-2 text-white/55">{TOTAL} technologies · 6 systems</div>

      <div className="mt-8 flex w-full gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Skill categories">
        {CLUSTERS.map((c) => {
          const on = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setTouched(true);
                setSelected(c.id);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                on ? "border-white bg-white text-[#050506]" : "border-white/12 text-white/55"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 w-full max-w-md px-5">
        <AnimatePresence mode="wait">
          <motion.section
            key={cluster.id}
            aria-label={cluster.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07080a]/80 p-5"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[rgba(255,162,76,0.1)] blur-3xl"
            />
            <div className="meta flex items-center justify-between text-white/40">
              <span className="flex items-center gap-3">
                <span style={{ color: "var(--warm)" }}>{String(clusterIndex + 1).padStart(2, "0")}</span>
                <span className="text-white/85">{cluster.label}</span>
              </span>
              <span>{String(cluster.skills.length).padStart(2, "0")}</span>
            </div>
            <div
              aria-hidden="true"
              className="mt-4 h-px"
              style={{ background: "linear-gradient(90deg, var(--cool), rgba(255,255,255,0.12) 60%, transparent)" }}
            />
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {cluster.skills.map((s, i) => (
                <motion.li
                  key={s.name}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease, delay: 0.08 + i * 0.05 }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-2 py-4 text-center"
                >
                  {s.src ? (
                    <img src={s.src} alt="" draggable={false} className="h-7 w-7 object-contain" />
                  ) : (
                    <span aria-hidden="true" className="ai-orb-mini h-7 w-7" />
                  )}
                  <span className="text-xs text-white/85">{s.name}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Skills() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <section id="skills" className="m-0 flex w-full flex-col items-center overflow-x-clip p-0 pt-24">
      <SectionHeading index="03" kicker="Technology universe" title="Skills" />
      {isDesktop ? <Constellation /> : <MobileUniverse />}
    </section>
  );
}

export default Skills;
