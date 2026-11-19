import { motion } from "motion/react";
import SectionHeading from "../../common/SectionHeading";
import Timeline from "../../common/Timeline";

const experienceData = [
  {
    year: "April 2025 - September 2026",
    role: "Software Developer",
    company: "Open Access Technology International Pvt. Ltd.",
    location: "Mohali, Punjab",
    points: [
      "Built interactive geospatial features in WebGeo using React.js and JavaScript, improving map interaction speed by 25%.",
      "Optimized Predicted BA Capacity Margin Map rendering with viewport-based data loading and marker handling, supporting N+ markers with 33% faster load time.",
      "Developed reusable UI components and Chart.js data visualizations for WebGIQ, an energy market analytics platform.",
      "Integrated frontend with REST APIs and shipped production features in collaboration with product and backend teams.",
      "Rated E1 - Exceeds Requirements for performance and contribution.",
    ],
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
  },
  {
    year: "September 2024 - November 2024",
    role: "Freelance Full Stack Developer",
    company: "Self-employed",
    location: "Remote",
    points: [
      "Built Safetied Form Builder, a drag-and-drop form builder for creating, arranging, and configuring custom form elements.",
      "Developed Green Roots, a full-stack landscaping booking application with booking flow, calendar, slot availability, and admin dashboard.",
    ],
  },
];

const renderContent = (item, isLeft) => (
  <>
    <div className="meta mb-4" style={{ color: "var(--warm)" }}>
      {item.year}
    </div>
    <h3 style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 700 }}>
      {item.role}
    </h3>
    <div className="mt-3 text-base font-semibold text-white/85">{item.company}</div>
    <div className="mt-1 text-sm text-white/40">{item.location}</div>
    <ul className="mt-7 space-y-3.5">
      {item.points.map((point, i) => (
        <motion.li
          key={point}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-sm leading-6 text-white/60 transition-colors duration-300 hover:text-white md:text-[0.95rem] md:leading-7"
        >
          <span
            aria-hidden="true"
            className={`absolute top-3 hidden h-1 w-1 rounded-full bg-white/40 md:block ${
              isLeft ? "-right-3.5" : "-left-3.5"
            }`}
          />
          {point}
        </motion.li>
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
        details={(item) => [
          { label: "Role", value: item.role },
          { label: "Company", value: item.company },
          { label: "Period", value: item.year },
        ]}
      />
    </section>
  );
}

export default Experience;
