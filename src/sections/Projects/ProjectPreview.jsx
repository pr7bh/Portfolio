import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUpRight, IconBrandGithub, IconX } from "@tabler/icons-react";
import { Magnetic } from "../../common/Interactive";
import Holo from "../../common/Holo";
import { unlock } from "../../common/achievements";
import { CASE_STUDIES } from "./caseStudies";

// Distinct case studies opened this visit (three earns "Curator").
const viewed = new Set();

const ease = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, "0");

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

function Overlay({ items, index, onClose, onNavigate }) {
  const item = items[index];
  const count = items.length;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 20 });
  const sy = useSpring(my, { stiffness: 70, damping: 20 });
  const imgX = useTransform(sx, (v) => v * -22);
  const imgY = useTransform(sy, (v) => v * -16);

  useEffect(() => {
    const previous = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNavigate((index + 1) % count);
      else if (e.key === "ArrowLeft") onNavigate((index - 1 + count) % count);
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll("a[href], button:not([disabled])");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onNavigate]);

  const tags = item.subtitle.split("•").map((t) => t.trim()).filter(Boolean);
  const study = CASE_STUDIES[item.title];
  const repos = study?.repos || (study?.repo ? [{ label: "GitHub", url: study.repo }] : []);
  const hasDetail = Boolean(study && (study.built.length || study.flow.length));

  useEffect(() => {
    viewed.add(item.title);
    if (viewed.size >= 3) unlock("curator");
    dialogRef.current?.scrollTo({ top: 0 });
  }, [item.title]);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-preview-title"
      className="fixed inset-0 z-[10010] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.45 }}
      onPointerMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <div className="fixed inset-0 bg-[#050506]/90 backdrop-blur-xl" onClick={onClose} />

      <AnimatePresence>
        <motion.div
          key={index}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          style={{
            background: `radial-gradient(55% 50% at 30% 45%, ${item.accent}2e, transparent 70%), radial-gradient(40% 40% at 85% 80%, ${item.accent}14, transparent 70%)`,
          }}
        />
      </AnimatePresence>

      <div className="pointer-events-none relative z-10 flex min-h-[100dvh] items-center justify-center">
        <div className="pointer-events-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-28 pt-24 md:px-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`media-${index}`}
              className="relative aspect-[16/10] w-full overflow-hidden rounded-[28px] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
              initial={{ clipPath: "inset(14% 14% 14% 14% round 28px)", opacity: 0 }}
              animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
              exit={{ clipPath: "inset(0% 0% 100% 0% round 28px)", opacity: 0, transition: { duration: 0.4, ease } }}
              transition={{ duration: 0.9, ease }}
            >
              <Holo className="absolute inset-0" max={7}>
                <motion.img
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ x: imgX, y: imgY, scale: 1.12 }}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
              </Holo>
              <span
                aria-hidden="true"
                className="absolute inset-x-10 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }}
              />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${index}`}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
              className="flex flex-col items-start"
            >
              <motion.div variants={fade} className="meta flex items-center gap-3 text-white/45">
                <span style={{ color: item.accent }}>{pad(index + 1)}</span>
                <span className="block h-px w-8 bg-white/20" />
                <span>{pad(count)}</span>
              </motion.div>

              <motion.h3
                id="project-preview-title"
                variants={fade}
                className="mt-6"
                style={{ fontSize: "clamp(2.5rem, 5.2vw, 4.75rem)", lineHeight: 0.95, letterSpacing: "-0.04em", fontWeight: 700 }}
              >
                {item.title}
              </motion.h3>
              {study?.kind && (
                <motion.p variants={fade} className="meta mt-4" style={{ color: item.accent }}>
                  {study.kind}
                </motion.p>
              )}

              <motion.ul variants={fade} className="mt-7 flex flex-wrap gap-2" aria-label="Highlights">
                {tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs text-white/70">
                    {tag}
                  </li>
                ))}
              </motion.ul>

              <motion.div variants={fade} className="mt-10 flex flex-wrap items-center gap-3">
                <Magnetic strength={0.25}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#050506] transition-colors duration-300 hover:bg-(--warm)"
                  >
                    Visit live site
                    <IconArrowUpRight
                      size={18}
                      stroke={2}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </Magnetic>
                {repos.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-4 text-sm font-medium text-white/85 transition-colors duration-300 hover:border-white/50 hover:text-white"
                  >
                    <IconBrandGithub size={17} stroke={1.6} />
                    {r.label}
                  </a>
                ))}
              </motion.div>
              {hasDetail && (
                <motion.button
                  type="button"
                  variants={fade}
                  onClick={() => document.getElementById("case-study")?.scrollIntoView({ behavior: "smooth" })}
                  className="meta mt-8 inline-flex items-center gap-2 text-white/55 transition-colors hover:text-white"
                >
                  <IconArrowDown size={14} stroke={1.75} className="animate-bounce" />
                  Case study
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {hasDetail && <CaseStudy key={`study-${index}`} study={study} accent={item.accent} />}

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="custom-cursor--close fixed right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black md:right-8 md:top-8"
      >
        <IconX size={20} stroke={1.75} />
      </button>

      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/40 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => onNavigate((index - 1 + count) % count)}
          aria-label="Previous project"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white"
        >
          <IconArrowLeft size={18} stroke={1.75} />
        </button>
        <span className="meta min-w-14 text-center text-white/55">
          {pad(index + 1)} / {pad(count)}
        </span>
        <button
          type="button"
          onClick={() => onNavigate((index + 1) % count)}
          aria-label="Next project"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white"
        >
          <IconArrowRight size={18} stroke={1.75} />
        </button>
      </div>
    </motion.div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease },
};

/* The scrollable write-up below the hero: what it is, what was built, how
   it fits together, and the stack. */
function CaseStudy({ study, accent }) {
  return (
    <section
      id="case-study"
      aria-label="Case study"
      className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-36 md:px-10"
    >
      <div className="grid grid-cols-1 gap-14 border-t border-white/10 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <motion.div {...reveal}>
          <p className="meta" style={{ color: accent }}>01 — Overview</p>
          <p className="mt-6 text-xl leading-relaxed text-white/80 md:text-2xl">{study.overview}</p>
        </motion.div>

        {study.built.length > 0 && (
          <motion.div {...reveal}>
            <p className="meta" style={{ color: accent }}>02 — What I built</p>
            <ul className="mt-6 space-y-4">
              {study.built.map((b, i) => (
                <li key={b} className="flex gap-4 text-base leading-7 text-white/75">
                  <span className="meta mt-1.5 shrink-0 text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {study.flow.length > 0 && (
        <motion.div {...reveal} className="mt-20">
          <p className="meta" style={{ color: accent }}>03 — How it fits together</p>
          <ol className="case-flow mt-8" style={{ "--accent": accent }}>
            {study.flow.map((step, i) => (
              <motion.li
                key={step}
                className="case-flow__node"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.12 }}
              >
                <span className="meta text-white/45">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-2 block text-sm font-medium text-white/90">{step}</span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      )}

      {study.stack.length > 0 && (
        <motion.div {...reveal} className="mt-20">
          <p className="meta" style={{ color: accent }}>04 — Stack</p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {study.stack.map((t) => (
              <li key={t} className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-white/80">
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </section>
  );
}

function ProjectPreview({ items, index, onClose, onNavigate }) {
  return (
    <AnimatePresence>
      {index !== null && (
        <Overlay key="project-preview" items={items} index={index} onClose={onClose} onNavigate={onNavigate} />
      )}
    </AnimatePresence>
  );
}

export default ProjectPreview;
