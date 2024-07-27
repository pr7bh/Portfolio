import './SkillList.css';

function SkillList({ src, skill }) {
  return (
    <span>
      <img src={src} alt="Checkmark icon" />
      <p className="wiggle">{skill}</p>
    </span>
  );
}

export default SkillList;
