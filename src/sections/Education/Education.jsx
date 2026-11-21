import { motion } from "motion/react";
import SectionHeading from "../../common/SectionHeading";
import Timeline, { CountUp } from "../../common/Timeline";

const educationData = [
  {
    year: "2020 - 2024",
    degree: "Bachelor of Technology",
    branch: "Computer Science and Engineering",
    score: "86.3%",
    institute: "Chandigarh Group of Colleges, Landran, Mohali, Punjab",
    board: "University degree",
  },
  {
    year: "2019 - 2020",
    degree: "Senior Secondary Education",
    branch: "Class 12",
    score: "92.6%",
    institute: "DAV Public School, Yamuna Nagar, Haryana",
    board: "CBSE",
  },
  {
    year: "2017 - 2018",
    degree: "Secondary Education",
    branch: "Class 10",
    score: "91.4%",
    institute: "DAV Public School, Yamuna Nagar, Haryana",
    board: "CBSE",
  },
];

const ease = [0.22, 1, 0.36, 1];
const R = 46;
const C = 2 * Math.PI * R;

/* A ring that fills to the score as it scrolls into view. */
function ScoreRing({ score }) {
  const pct = parseFloat(score) / 100;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--cool)" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="1" stopColor="var(--warm)" />
          </linearGradient>
        </defs>
        <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle
          cx="56"
          cy="56"
          r={R}
          fill="none"
          stroke="url(#score-ring)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: C * (1 - pct) }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.4, ease }}
          style={{ filter: "drop-shadow(0 0 6px rgba(255,162,76,0.45))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp value={score} className="text-xl font-bold text-white" />
        <span className="meta mt-0.5 text-[0.52rem]! text-white/50">Score</span>
      </div>
    </div>
  );
}

const renderContent = (item) => (
  <>
    <div className="meta mb-4 md:hidden" style={{ color: "var(--warm)" }}>
      {item.year}
    </div>
    <h3 style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 700 }}>
      {item.degree}
    </h3>
    <div className="mt-3 text-base font-semibold text-white/85">{item.branch}</div>
    <div className="mt-1 text-sm text-white/55">{item.institute}</div>
  </>
);

const renderAside = (item, { isLeft }) => (
  <div className={`flex items-center gap-5 ${isLeft ? "" : "md:flex-row-reverse"}`}>
    <ScoreRing score={item.score} />
    <div>
      <div className="meta hidden md:block" style={{ color: "var(--warm)" }}>
        {item.year}
      </div>
      <div className={`mt-0 flex flex-wrap gap-2 md:mt-3 ${isLeft ? "" : "md:justify-end"}`}>
        <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/75">{item.board}</span>
      </div>
    </div>
  </div>
);

function Education() {
  return (
    <section
      id="education"
      className="relative flex w-full flex-col items-center overflow-hidden px-5 py-24 md:px-10"
    >
      <SectionHeading index="04" kicker="Foundations" title="Education" />
      <Timeline
        items={educationData}
        getKey={(item) => item.year}
        renderContent={renderContent}
        renderAside={renderAside}
      />
    </section>
  );
}

export default Education;
