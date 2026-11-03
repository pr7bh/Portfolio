import { useEffect, useRef } from "react";
import Folder from "../../common/Folder";

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

function Education() {
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

      comet.style.opacity = progress > 0 && progress < 1 ? "1" : "0";
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
      id="education"
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
      <h2 className="sectionTitle mb-20 text-center">Education</h2>

      {/* Timeline */}
      <div data-education-timeline className="relative w-full max-w-6xl">
        {/* Center line */}
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

        {/* Scroll comet - same as Experience */}
        <div
          ref={cometRef}
          aria-hidden="true"
          className="
            pointer-events-none
            fixed
            left-1/2
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

        {/* Education items */}
        <div className="relative flex flex-col gap-28 md:gap-36">
          {educationData.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <article
                key={item.year}
                className="
          relative
          grid
          w-full
          grid-cols-1
          md:grid-cols-[1fr_80px_1fr]
          md:items-start
        "
              >
                {/* EDUCATION CONTENT */}
                <div
                  className={`
            pl-10
            ${
              isLeft
                ? "md:col-start-1 md:pr-10 md:pl-0 md:text-right"
                : "md:col-start-3 md:pl-10 md:text-left"
            }
          `}
                >
                  <div
                    className={`
              mx-auto max-w-xl
              ${isLeft ? "md:mr-0 md:ml-auto" : "md:ml-0 md:mr-auto"}
            `}
                  >
                    <p className="mb-2 text-sm font-semibold tracking-[0.12em] text-slate-400">
                      {item.year}
                    </p>

                    <h3
                      className="
                text-2xl font-bold tracking-tight text-white
                transition-all duration-300
                hover:[text-shadow:0_0_12px_rgba(255,255,255,0.65)]
                md:text-3xl
              "
                    >
                      {item.degree}
                    </h3>

                    <p className="mt-2 text-base font-semibold text-white/80">
                      {item.branch}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                      {item.institute}
                    </p>

                    <span className="mt-4 inline-flex rounded-full border border-slate-400/30 bg-slate-400/10 px-3 py-1 text-sm font-bold text-slate-300">
                      {item.score}
                    </span>
                  </div>
                </div>

                {/* CENTER NODE */}
                <div
                  className="
            pointer-events-none relative hidden
            md:col-start-2 md:row-start-1
            md:flex md:justify-center
          "
                >
                  <div className="relative z-20 mt-1 h-5 w-5 rounded-full border border-white/40 bg-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.12)]">
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                  </div>
                </div>

                {/* MOBILE NODE */}
                <div
                  className="
            absolute left-0 top-1 z-20 flex h-5 w-5
            -translate-x-1/2 items-center justify-center
            rounded-full border border-white/40 bg-slate-950
            shadow-[0_0_12px_rgba(255,255,255,0.2)]
            md:hidden
          "
                >
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>

                {/* FOLDER — OPPOSITE SIDE */}
                <div
                  className={`
            relative z-10 mt-8 flex justify-center
            md:row-start-1 md:mt-0
            ${
              isLeft
                ? "md:col-start-3 md:justify-start md:pl-10"
                : "md:col-start-1 md:justify-end md:pr-10"
            }
          `}
                >
                  <Folder
                    size={1.25}
                    color="#64748B"
                    className="custom-folder"
                    items={[
                      <div
                        key="degree"
                        className="flex h-full w-full items-center justify-center p-2 text-center"
                      >
                        <span className="text-xs font-bold text-neutral-800">
                          {item.degree}
                        </span>
                      </div>,
                      <div
                        key="score"
                        className="flex h-full w-full items-center justify-center p-2 text-center"
                      >
                        <span className="text-xs font-bold text-neutral-800">
                          {item.score}
                        </span>
                      </div>,
                      <div
                        key="branch"
                        className="flex h-full w-full items-center justify-center p-2 text-center"
                      >
                        <span className="text-xs font-bold text-neutral-800">
                          {item.branch}
                        </span>
                      </div>,
                    ]}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Mobile timeline line */}
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

export default Education;
