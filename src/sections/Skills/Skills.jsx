import styles from './SkillsStyles.module.css';
import checkMarkIconDark from '../../assets/checkmark-dark.svg';
import checkMarkIconLight from '../../assets/checkmark-light.svg';
import reactIcon from '../../assets/react.svg'
import tailwindIcon from '../../assets/tailwind.svg'
import expressIcon from '../../assets/express.svg'
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
import SkillList from '../../common/SkillList';
import { useTheme } from '../../common/ThemeContext';

function Skills() {
  const { theme } = useTheme();
  const checkMarkIcon = theme === 'light' ? checkMarkIconLight : checkMarkIconDark;

  return (
    <section id="skills" className={styles.container}>
      <h1 className="sectionTitle">Skills</h1>
      
      <div className={styles.skillList}>
        <SkillList src={reactIcon} skill="React" />
        <SkillList src={tailwindIcon} skill="Tailwind CSS" />
        <SkillList src={expressIcon} skill="Express" />
        <SkillList src={mongodbIcon} skill="MongoDB" />
        <SkillList src={nodejsIcon} skill="Node" />
      </div>
      <hr />
      <div className={styles.skillList}>
        <SkillList src={htmlIcon} skill="HTML" />
        <SkillList src={cssIcon} skill="CSS" />
        <SkillList src={javascriptIcon} skill="JavaScript" />
        <SkillList src={javaIcon} skill="Java" />
        <SkillList src={cppIcon} skill="C/C++" />
        <SkillList src={pythonIcon} skill="Python" />
      </div>
      <hr />
      <div className={styles.skillList}>
        <SkillList src={reduxIcon} skill="Redux" />
        <SkillList src={gitIcon} skill="Git" />
        <SkillList src={mysqlIcon} skill="MySQL" />
      </div>
    </section>
  );
}

export default Skills;
