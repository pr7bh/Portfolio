import reactIcon from '../../assets/react.svg';
import tailwindIcon from '../../assets/tailwind.svg';
import expressIcon from '../../assets/FastAPI.svg';
import mongodbIcon from '../../assets/mongodb.svg';
import nodejsIcon from '../../assets/node-js.svg';
import htmlIcon from '../../assets/html.svg';
import cssIcon from '../../assets/css.svg';
import javascriptIcon from '../../assets/javascript.svg';
import javaIcon from '../../assets/java.svg';
import cppIcon from '../../assets/c-cpp.svg';
import pythonIcon from '../../assets/python.svg';
import reduxIcon from '../../assets/redux.svg';
import gitIcon from '../../assets/git.svg';
import mysqlIcon from '../../assets/mysql.svg';

import OrbitImages from '../../common/OrbitImages';

function Skills() {
  const images = [
    reactIcon,
    tailwindIcon,
    expressIcon,
    mongodbIcon,
    nodejsIcon,
    htmlIcon,
    cssIcon,
    javascriptIcon,
    javaIcon,
    cppIcon,
    pythonIcon,
    reduxIcon,
    gitIcon,
    mysqlIcon,
  ];

  return (
    <section
      id="skills"
      className="flex w-full flex-col items-center p-0 m-0 pt-30"
    >
      <h2 className="sectionTitle">Skills</h2>

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
    </section>
  );
}

export default Skills;