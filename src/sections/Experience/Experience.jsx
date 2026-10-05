import {useEffect, useRef } from "react";

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

function Experience() {
  const sectionRef = useRef(null);
  const cometRef = useRef(null);

  useEffect(() => {
  let ticking = false;

  const updateComet = () => {
    const section = sectionRef.current;
    const comet = cometRef.current;

    if (!section || !comet) return;

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const start = viewportHeight * 0.25;
    const end = -rect.height * 0.75;

    const distance = start - end;
    const travelled = start - rect.top;

    let progress = travelled / distance;

    progress = Math.max(0, Math.min(1, progress));

    comet.style.opacity =
      progress > 0 && progress < 1 ? "1" : "0";
  };

  const handleScroll = () => {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updateComet();
      ticking = false;
    });
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  window.addEventListener("resize", handleScroll);

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="
        relative
        flex
        w-full
        flex-col
        items-center
        overflow-hidden
        px-5
        py-24
        md:px-10
      "
    >
      {/* Heading */}
      <h1 className="sectionTitle mb-20 text-center">
        Experience
      </h1>

      {/* Timeline */}
      <div
        data-experience-timeline
        className="
          relative
          w-full
          max-w-6xl
        "
      >
        {/* ================= CENTER LINE ================= */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            top-0
            hidden
            w-px
            -translate-x-1/2
            bg-white/15
            md:block
          "
        />

        {/* Soft line glow */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            top-0
            hidden
            w-0.75
            -translate-x-1/2
            bg-linear-to-b
            from-transparent
            via-white/10
            to-transparent
            blur-[3px]
            md:block
          "
        />

        {/* ================= SCROLL COMET ================= */}

        <div
            ref={cometRef}
            className="
                pointer-events-none
                fixed
                left-[calc(50%-5px)]
                top-1/2
                z-999
                hidden
                h-1
                w-1
                -translate-x-1/2
                -translate-y-1/2
                md:block
            "
            >
          {/* Long comet trail */}
          <div
            className="
              absolute
              bottom-0
              left-1/2
              h-32
              w-0.5
              -translate-x-1/2
              bg-linear-to-t
              from-transparent
              via-white/20
              to-white
              blur-[1px]
            "
          />

          {/* Outer glow */}
          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-10
              w-10
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white/20
              blur-xl
            "
          />

          {/* Comet head */}
          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-3
              w-3
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white
              shadow-[0_0_8px_2px_rgba(255,255,255,0.95),0_0_25px_8px_rgba(255,255,255,0.35)]
            "
          />

          {/* Tiny bright core */}
          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-1
              w-1
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white
            "
          />
        </div>

        {/* ================= EXPERIENCE ITEMS ================= */}

        <div className="relative flex flex-col gap-28 md:gap-36">
          {experienceData.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <article
                key={`${item.company}-${item.year}`}
                className="
                  relative
                  grid
                  w-full
                  grid-cols-1
                  md:grid-cols-[1fr_80px_1fr]
                  md:items-start
                "
              >
                {/* ================= LEFT ================= */}

                <div
                    className={`
                        pl-10
                        ${
                        isLeft
                            ? "md:pr-10 md:pl-0 md:text-right"
                            : "md:col-start-3 md:pl-10 md:text-left"
                        }
                    `}
                    >
                  <div className="mx-auto max-w-xl md:mx-0">
                    <p
                      className="
                        mb-2
                        text-sm
                        font-semibold
                        tracking-[0.12em]
                        text-slate-400
                      "
                    >
                      {item.year}
                    </p>

                    <h2
                      className="
                        text-2xl
                        font-bold
                        tracking-tight
                        text-white
                        md:text-3xl
                      "
                    >
                      {item.role}
                    </h2>

                    <p
                      className="
                        mt-2
                        text-base
                        font-semibold
                        text-white/80
                      "
                    >
                      {item.company}
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-white/40
                      "
                    >
                      {item.location}
                    </p>

                    <ul
                      className={`
                        mt-6
                        space-y-3
                        ${
                          isLeft
                            ? "md:ml-auto"
                            : ""
                        }
                      `}
                    >
                      {item.points.map((point) => (
                        <li
                          key={point}
                          className="
                            relative
                            pl-5
                            text-sm
                            leading-6
                            text-white/60
                            md:text-base
                            md:pl-0
                          "
                        >
                          <span
                            className={`
                              absolute
                              top-2.5
                              hidden
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-white/50
                              md:block
                              ${
                                isLeft
                                  ? "-right-3"
                                  : "-left-3"
                              }
                            `}
                          />

                          <span className="md:block">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ================= CENTER NODE ================= */}

                <div
                  className="
                    pointer-events-none
                    relative
                    hidden
                    md:col-start-2
                    md:row-start-1
                    md:flex
                    md:justify-center
                  "
                >
                  <div
                    className="
                      relative
                      z-20
                      mt-1
                      h-5
                      w-5
                      rounded-full
                      border
                      border-white/40
                      bg-slate-950
                      shadow-[0_0_20px_rgba(255,255,255,0.12)]
                    "
                  >
                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        h-2
                        w-2
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-white
                      "
                    />
                  </div>
                </div>

                {/* ================= MOBILE NODE ================= */}

                <div
                className="
                    absolute
                    left-0
                    top-1
                    z-20
                    flex
                    h-5
                    w-5
                    -translate-x-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/40
                    bg-slate-950
                    shadow-[0_0_12px_rgba(255,255,255,0.2)]
                    md:hidden
                "
                >
                <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Mobile line */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-24
          left-5
          top-40
          w-px
          bg-white/10
          md:hidden
        "
      />
    </section>
  );
}

export default Experience;