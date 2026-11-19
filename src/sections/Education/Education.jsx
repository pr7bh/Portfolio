import SectionHeading from "../../common/SectionHeading";
import Timeline from "../../common/Timeline";

const educationData = [
  {
    year: "2020 - 2024",
    degree: "Bachelor of Technology",
    branch: "Computer Science",
    score: "86.3%",
    institute: "Chandigarh Group of Colleges, Landran, Mohali, Punjab",
  },
  {
    year: "2019 - 2020",
    degree: "Senior Secondary Education",
    branch: "Class 12",
    score: "92.6%",
    institute: "DAV Public School, Yamuna Nagar, Haryana",
  },
  {
    year: "2017 - 2018",
    degree: "Secondary Education",
    branch: "Class 10",
    score: "91.4%",
    institute: "DAV Public School, Yamuna Nagar, Haryana",
  },
];

const renderContent = (item) => (
  <>
    <div className="meta mb-4" style={{ color: "var(--warm)" }}>
      {item.year}
    </div>
    <h3 style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 700 }}>
      {item.degree}
    </h3>
    <div className="mt-3 text-base font-semibold text-white/85">{item.branch}</div>
    <div className="mt-1 text-sm text-white/40">{item.institute}</div>
    <span className="mt-5 inline-flex items-baseline gap-2 rounded-full border border-white/12 px-4 py-1.5">
      <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: "var(--font-mono)" }}>
        Score
      </span>
      <span className="text-sm font-bold text-white">{item.score}</span>
    </span>
  </>
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
        details={(item) => [
          { label: "Degree", value: item.degree },
          { label: "Score", value: item.score },
          { label: "Branch", value: item.branch },
        ]}
      />
    </section>
  );
}

export default Education;
