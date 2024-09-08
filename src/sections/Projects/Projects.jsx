import styles from './ProjectsStyles.module.css';
import studyNotion from '../../assets/studyNotion.png';
import netflix from '../../assets/netflix.png';
import cryptocurrency from '../../assets/cryptocurrency.png';
import shoppingcart from '../../assets/shoppingcart.png';
import snakegame from '../../assets/snakeGame.png';
import ProjectCard from '../../common/ProjectCard';


function Projects() {
  return (
    <section id="projects" className={styles.container}>
      <h1 className="sectionTitle">Projects</h1>
      <div className={styles.projectsContainer}>
      
        <ProjectCard
          src={studyNotion}
          link="https://github.com/pr7bh/Edtech_Project_StudyNotion"
          h3="StudyNotion"
          p="Edtech Platform" 
        />
        

        <ProjectCard
          src={netflix}
          link="https://netflix-clone-yc80.onrender.com/"
          h3="Netflix Clone"
          p="Streaming Platform"
        />
        <ProjectCard
          src={cryptocurrency}
          link="https://cryptoverse7.vercel.app/"
          h3="Cryptoverse"
          p="Cryptocurrency App"
        />
        <ProjectCard
          src={shoppingcart}
          link="https://github.com/pr7bh/Shopping_Cart"
          h3="Shopping Cart"
          p="E-commerce App"
        />
        <ProjectCard
          src={snakegame}
          link="https://github.com/pr7bh/Snake_Game_JAVA"
          h3="Snake Game"
          p="Game developed by Java"
        />
      </div>
    </section>
  );
}

export default Projects;
