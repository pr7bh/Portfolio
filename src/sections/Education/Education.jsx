import Folder from "../../common/Folder";

const educationData = [
  {
    year: "2020 - 2024",
    degree: "Bachelor of Technology",
    branch: "Computer Science",
    score: "86.3%",
    institute:
      "Chandigarh Group of Colleges, Landran, Mohali, Punjab",
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
  return (
    <section
      id="education"
      className="flex w-full flex-col items-center px-5 py-20 md:px-10"
    >
      <h1 className="sectionTitle mb-16 text-center">
        Education
      </h1>

      <div className="flex w-full max-w-6xl flex-col items-center gap-16">
        {educationData.map((item, index) => (
          <div
            key={item.year}
            className="relative flex w-full max-w-6xl items-center justify-center gap-8 md:gap-14"
          >
            {/* Timeline line */}
            {index !== educationData.length - 1 && (
              <div
                className="
                  absolute
                  left-[50px]
                  top-[110px]
                  h-[100px]
                  w-[2px]
                  bg-gradient-to-b
                  from-[#5227FF]
                  to-transparent
                  md:left-[60px]
                "
              />
            )}

            {/* Folder */}
            <div className="relative z-10 shrink-0">
              <Folder
                size={1.25}
                color="#5227FF"
                className="custom-folder"
                items={[
                  <div className="flex h-full w-full items-center justify-center p-2 text-center">
                    <span className="text-xs font-bold text-neutral-800">
                      {item.degree}
                    </span>
                  </div>,

                  <div className="flex h-full w-full items-center justify-center p-2 text-center">
                    <span className="text-xs font-bold text-neutral-800">
                      {item.score}
                    </span>
                  </div>,

                  <div className="flex h-full w-full items-center justify-center p-2 text-center">
                    <span className="text-xs font-bold text-neutral-800">
                      {item.branch}
                    </span>
                  </div>,
                ]}
              />
            </div>

            {/* Education content */}
            <div className="flex-1 text-right">
              <p className="mb-2 text-sm font-bold tracking-wider text-[#5227FF]">
                {item.year}
              </p>

              <h2 className="text-xl font-bold text-neutral-900 dark:text-white md:text-2xl">
                {item.degree}
              </h2>

              <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {item.branch}
              </p>

              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 md:text-base">
                {item.institute}
              </p>

              <span className="mt-3 inline-flex rounded-full border border-[#5227FF]/30 bg-[#5227FF]/10 px-3 py-1 text-sm font-bold text-[#5227FF]">
                {item.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Education;