import { useEffect, useState } from "react";

import reactIcon      from "../../assets/react.svg";
import tailwindIcon   from "../../assets/tailwind.svg";
import expressIcon    from "../../assets/FastAPI.svg";
import mongodbIcon    from "../../assets/mongodb.svg";
import nodejsIcon     from "../../assets/node-js.svg";
import htmlIcon       from "../../assets/html.svg";
import cssIcon        from "../../assets/css.svg";
import javascriptIcon from "../../assets/javascript.svg";
import javaIcon       from "../../assets/java.svg";
import cppIcon        from "../../assets/c-cpp.svg";
import pythonIcon     from "../../assets/python.svg";
import reduxIcon      from "../../assets/redux.svg";
import gitIcon        from "../../assets/git.svg";
import mysqlIcon      from "../../assets/mysql.svg";

import OrbitImages from "../../common/OrbitImages";

const SKILLS = [
  { src: reactIcon,      name: "React" },
  { src: tailwindIcon,   name: "Tailwind" },
  { src: expressIcon,    name: "FastAPI" },
  { src: mongodbIcon,    name: "MongoDB" },
  { src: nodejsIcon,     name: "Node.js" },
  { src: htmlIcon,       name: "HTML" },
  { src: cssIcon,        name: "CSS" },
  { src: javascriptIcon, name: "JavaScript" },
  { src: javaIcon,       name: "Java" },
  { src: cppIcon,        name: "C / C++" },
  { src: pythonIcon,     name: "Python" },
  { src: reduxIcon,      name: "Redux" },
  { src: gitIcon,        name: "Git" },
  { src: mysqlIcon,      name: "MySQL" },
];

function Skills() {
  const images = SKILLS.map((s) => s.src);

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <section
      id="skills"
      className="flex w-full flex-col items-center p-0 m-0 pt-30"
    >
      <h2 className="sectionTitle">Skills</h2>

      {isDesktop ? (
        /* Desktop — Framer Motion orbit, never mounted on mobile/tablet */
        <div className="relative flex w-full md:h-200 items-center justify-center overflow-hidden">
          <OrbitImages
            images={images}
            shape="infinity"
            radiusX={480}
            radiusY={300}
            rotation={1}
            duration={30}
            itemSize={80}
            responsive={true}
            radius={600}
            direction="reverse"
            fill
            showPath={false}
            paused={false}
          />
        </div>
      ) : (
        /* Mobile / tablet — floating icons, no borders/labels */
        <>
          <style>{`
            @keyframes skillFloat {
              0%,100% { transform: translateY(0px)   rotate(0deg)  scale(1);    }
              30%     { transform: translateY(-16px) rotate(5deg)  scale(1.1);  }
              70%     { transform: translateY(10px)  rotate(-4deg) scale(0.94); }
            }
            @keyframes skillFloatB {
              0%,100% { transform: translateY(0px)   rotate(0deg)   scale(1);   }
              40%     { transform: translateY(14px)  rotate(-6deg)  scale(1.08);}
              75%     { transform: translateY(-10px) rotate(3deg)   scale(0.96);}
            }
            @keyframes skillFloatC {
              0%,100% { transform: translateY(0px)   rotate(0deg)  scale(1);    }
              25%     { transform: translateY(-12px) rotate(4deg)  scale(1.06); }
              60%     { transform: translateY(8px)   rotate(-5deg) scale(0.97); }
            }
          `}</style>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "420px",
              overflow: "hidden",
            }}
          >
            {[
              { left: "8%",  top: "8%"  },
              { left: "40%", top: "4%"  },
              { left: "72%", top: "10%" },
              { left: "88%", top: "28%" },
              { left: "6%",  top: "32%" },
              { left: "30%", top: "38%" },
              { left: "60%", top: "32%" },
              { left: "82%", top: "50%" },
              { left: "18%", top: "58%" },
              { left: "48%", top: "62%" },
              { left: "74%", top: "68%" },
              { left: "5%",  top: "76%" },
              { left: "35%", top: "80%" },
              { left: "64%", top: "84%" },
            ].map((pos, i) => {
              const anims = ["skillFloat", "skillFloatB", "skillFloatC"];
              const anim  = anims[i % 3];
              const dur   = 3.4 + (i % 5) * 0.55;
              const delay = -(i * 0.42);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    animation: `${anim} ${dur}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <img
                    src={SKILLS[i].src}
                    alt={SKILLS[i].name}
                    draggable={false}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                      display: "block",
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default Skills;
