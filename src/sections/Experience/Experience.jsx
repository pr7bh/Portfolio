import { motion } from "motion/react";
import SectionHeading from "../../common/SectionHeading";
import Timeline, { CountUp } from "../../common/Timeline";

/* Bullets follow the CV. `highlights` are the headline numbers shown in the
   facts panel beside each role; `stack` is the tech used there. */
const experienceData = [
  {
    year: "April 2025 - September 2026",
    role: "Software Developer",
    company: "Open Access Technology International Pvt. Ltd.",
    location: "Mohali, Punjab",
    points: [
      "Built interactive geospatial features in WebGeo using React.js, improving map interaction speed by 25%.",
      "Integrated an AI chatbot into WebGeo for Q&A over map and energy data, using an LLM API with RAG behind a FastAPI service.",
      "Optimized Predicted BA Capacity Margin Map rendering with viewport-based data loading and marker handling, reducing load time by 33%.",
      "Built a 24-hour capacity margin forecast using linear regression, served through FastAPI endpoints and displayed per balancing authority on the map.",
      "Developed reusable UI components and Chart.js visualizations for WebGIQ, an energy market analytics platform.",
      "Rated E1 (Exceeds Requirements) for performance and contribution.",
    ],
    highlights: [
      { value: "25%", label: "Faster map interaction" },
      { value: "33%", label: "Faster map load" },
      { value: "E1", label: "Performance rating" },
    ],
    stack: ["React.js", "JavaScript", "FastAPI", "LLM + RAG", "Linear regression", "Chart.js"],
  },
  {
    year: "December 2024 - April 2025",
    role: "Software Engineer",
    company: "Carvia Technologies",
    location: "Mohali, Punjab",
    points: [
      "Built TrackIt, a Jira-like project and issue tracking application using React.js with boards, ticket workflows, and assignments.",
      "Built Watchdog, a service monitoring dashboard showing real-time service status, alerts, and uptime history.",
      "Built reusable components and improved application performance by 15% while working with cross-functional teams.",
    ],
    highlights: [
      { value: "2", label: "Products shipped" },
      { value: "15%", label: "Performance gain" },
    ],
    stack: ["React.js", "JavaScript", "REST APIs"],
  },
  {
    year: "September 2024 - November 2024",
    role: "Freelance Full Stack Developer",
    company: "Self-employed",
    location: "Remote",
    points: [
      "Built the Safetied form builder module: a drag-and-drop tool to add, arrange, and configure form elements.",
      "Developed Green Roots, a full-stack booking application for a Canadian landscaping company, with booking flow, calendar, slot availability, and an admin dashboard.",
    ],
    highlights: [
      { value: "2", label: "Client products" },
      { value: "1", label: "International client" },
    ],
    stack: ["React.js", "Node.js", "Full stack"],
  },
];

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "April 2025 - September 2026" → "1 yr 6 mos" (both months counted). */
function duration(range) {
  const parse = (s) => {
    const [m, y] = s.trim().split(/\s+/);
    return Number(y) * 12 + MONTHS.indexOf(m.slice(0, 3).toLowerCase());
  };
  const [from, to] = range.split(/\s+[-–]\s+/);
  const months = parse(to) - parse(from) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

const renderContent = (item) => (
  <>
    <div className="meta mb-4 md:hidden" style={{ color: "var(--warm)" }}>
      {item.year}
    </div>
    <h3 style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 700 }}>
      {item.role}
    </h3>
    <div className="mt-3 text-base font-semibold text-white/85">{item.company}</div>
    <ul className="mt-6 space-y-3.5 border-t border-white/[0.07] pt-6">
      {item.points.map((point, i) => (
        <motion.li
          key={point}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="relative pl-5 text-sm leading-6 text-white/65 transition-colors duration-300 hover:text-white md:text-[0.95rem] md:leading-7"
        >
          <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-(--warm)/70" />
          {point}
        </motion.li>
      ))}
    </ul>
  </>
);

const renderAside = (item, { isLeft }) => (
  <>
    <div className="meta hidden md:block" style={{ color: "var(--warm)" }}>
      {item.year}
    </div>
    <div className={`mt-0 flex flex-wrap gap-2 md:mt-3 ${isLeft ? "" : "md:justify-end"}`}>
      <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/75">{duration(item.year)}</span>
      <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/75">{item.location}</span>
    </div>

    <dl className={`mt-7 grid grid-cols-3 gap-4 ${isLeft ? "" : "md:[direction:rtl]"}`}>
      {item.highlights.map((h) => (
        <div key={h.label} className="[direction:ltr]">
          <dd className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            <CountUp value={h.value} />
          </dd>
          <dt className="meta mt-2 text-[0.58rem]! leading-4 text-white/55">{h.label}</dt>
        </div>
      ))}
    </dl>

    <ul className={`mt-7 flex flex-wrap gap-1.5 ${isLeft ? "" : "md:justify-end"}`} aria-label="Stack">
      {item.stack.map((t) => (
        <li key={t} className="rounded-lg bg-white/[0.05] px-2.5 py-1 font-mono text-[0.68rem] text-white/70">
          {t}
        </li>
      ))}
    </ul>
  </>
);

function Experience() {
  return (
    <section
      id="experience"
      className="relative flex w-full flex-col items-center overflow-hidden px-5 py-24 md:px-10"
    >
      <SectionHeading index="01" kicker="Career trajectory" title="Experience" />
      <Timeline
        items={experienceData}
        getKey={(item) => `${item.company}-${item.year}`}
        renderContent={renderContent}
        renderAside={renderAside}
      />
    </section>
  );
}

export default Experience;
