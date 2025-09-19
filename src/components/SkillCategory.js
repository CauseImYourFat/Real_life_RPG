import React from 'react';
import SkillCircle from './SkillCircle';

function SkillCategory({ 
  categoryName, 
  categoryData, 
  skills, 
  skillData, 
  onSkillClick, 
  onSkillRightClick, 
  getSkillLevel,
  onRemoveCustomSkill,
  editMode
}) {
  const handleIncrement = (e, categoryName, skillName, currentLevel) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Increment clicked:', categoryName, skillName, currentLevel);
    const newLevel = Math.min((currentLevel || 0) + 1, 10);
    console.log('New level:', newLevel);
    onSkillClick(categoryName, skillName, newLevel);
  };

  const handleDecrement = (e, categoryName, skillName, currentLevel) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Decrement clicked:', categoryName, skillName, currentLevel);
    const newLevel = Math.max((currentLevel || 0) - 1, 0);
    console.log('New level:', newLevel);
    onSkillClick(categoryName, skillName, newLevel);
  };

  return (
    <div className="skill-category">
      <div className="category-header">
        <span className="category-icon-large">{categoryData.icon}</span>
        <h3 className="category-title">{categoryName}</h3>
        <p className="category-description">
          {getCategoryDescription(categoryName)}
        </p>
      </div>
      <div className="skills-list">
        {skills.map((skill, index) => {
          const skillLevel = getSkillLevel(categoryName, skill.name);
          const isCustomSkill = skill.isCustom;
          return (
            <div 
              key={`${skill.name}-${index}`}
              className="skill-item"
              onContextMenu={(e) => onSkillRightClick(e, categoryName, skill.name, skillLevel)}
            >
              <div className="skill-circle-container">
                <SkillCircle 
                  level={skillLevel} 
                  maxLevel={10}
                  size={60}
                />
              </div>
              <div className="skill-info">
                <h4 className="skill-name">
                  {skill.name}
                  {editMode && (
                    <button 
                      className="remove-skill-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCustomSkill(categoryName, skill.name);
                      }}
                      title={isCustomSkill ? "Remove custom skill" : "Remove default skill"}
                    >
                      ✕
                    </button>
                  )}
                </h4>
                <p className="skill-description">{skill.description}</p>
              </div>
              <div className="skill-controls">
                <button 
                  className="skill-btn increment"
                  onClick={(e) => handleIncrement(e, categoryName, skill.name, skillLevel)}
                  disabled={skillLevel >= 10}
                  title="Increase skill level"
                >
                  ▲
                </button>
                <div className="skill-level-display">
                  {skillLevel}/10
                </div>
                <button 
                  className="skill-btn decrement"
                  onClick={(e) => handleDecrement(e, categoryName, skill.name, skillLevel)}
                  disabled={skillLevel <= 0}
                  title="Decrease skill level"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCategoryDescription(categoryName) {
  const descriptions = {
    'Physical': 'Develop your body and physical capabilities',
    'Social': 'Master interpersonal communication and influence',
    'Combat': 'Learn self-defense and tactical skills',
    'Science': 'Expand your knowledge of the natural world',
    'Technology': 'Master digital and engineering skills',
    'Piloting': 'Control vehicles and advanced systems'
  };
  return descriptions[categoryName] || 'Develop skills in this category';
}

export default SkillCategory;
