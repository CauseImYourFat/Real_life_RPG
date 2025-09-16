import React, { useState, useEffect } from 'react';
import carpenterGif from '../../assets/Carpenter_Paschalis_Rathskellers.gif';
import SkillCategory from './SkillCategory';
import SkillModal from './SkillModal';

const STARFIELD_SKILLS = {
  'Physical': {
    icon: '💪',
    skills: [
      { name: 'Boxing', description: 'Hand-to-hand combat and fitness' },
      { name: 'Fitness', description: 'Overall physical conditioning' },
      { name: 'Running', description: 'Cardiovascular endurance' },
      { name: 'Gymnastics', description: 'Flexibility and body control' },
      { name: 'Martial Arts', description: 'Discipline and self-defense' },
      { name: 'Weight Training', description: 'Strength and muscle building' }
    ]
  },
  'Social': {
    icon: '🗣️',
    skills: [
      { name: 'Persuasion', description: 'Influence and convince others' },
      { name: 'Commerce', description: 'Business and trading skills' },
      { name: 'Deception', description: 'Strategic misdirection when needed' },
      { name: 'Intimidation', description: 'Assertiveness and presence' },
      { name: 'Negotiation', description: 'Deal-making and compromise' },
      { name: 'Leadership', description: 'Guide and inspire others' }
    ]
  },
  'Combat': {
    icon: '⚔️',
    skills: [
      { name: 'Pistol Certification', description: 'Handgun proficiency' },
      { name: 'Rifle Certification', description: 'Long-range weapon skills' },
      { name: 'Shotgun Certification', description: 'Close-range weapon mastery' },
      { name: 'Targeting', description: 'Precision and accuracy' },
      { name: 'Demolitions', description: 'Explosive handling (theoretical)' },
      { name: 'Dueling', description: 'One-on-one combat tactics' }
    ]
  },
  'Science': {
    icon: '🔬',
    skills: [
      { name: 'Medicine', description: 'Health and healing knowledge' },
      { name: 'Research Methods', description: 'Scientific investigation' },
      { name: 'Surveying', description: 'Observation and measurement' },
      { name: 'Botany', description: 'Plant science and biology' },
      { name: 'Zoology', description: 'Animal behavior and biology' },
      { name: 'Geology', description: 'Earth sciences and materials' }
    ]
  },
  'Technology': {
    icon: '💻',
    skills: [
      { name: 'Programming', description: 'Software development' },
      { name: 'Security', description: 'Cybersecurity and protection' },
      { name: 'Engineering', description: 'Design and construction' },
      { name: 'Electronics', description: 'Circuit design and repair' },
      { name: 'Robotics', description: 'Automation and AI systems' },
      { name: 'Starship Design', description: 'Advanced vehicle engineering' }
    ]
  },
  'Piloting': {
    icon: '🚀',
    skills: [
      { name: 'Piloting', description: 'Vehicle operation and control' },
      { name: 'Targeting Control Systems', description: 'Weapon system operation' },
      { name: 'Missile Weapon Systems', description: 'Advanced projectile control' },
      { name: 'Particle Beam Weapon Systems', description: 'Energy weapon mastery' },
      { name: 'Automated Weapon Systems', description: 'AI-assisted combat' },
      { name: 'Boost Pack Training', description: 'Advanced mobility systems' }
    ]
  }
};

function SkillsPage({ skillData, onUpdateSkill, onRemoveSkill }) {
  const [selectedCategory, setSelectedCategory] = useState('Physical');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [customSkills, setCustomSkills] = useState({});

  const handleSkillClick = (categoryName, skillName, newLevel) => {
    // Use the newLevel directly (it's already calculated in SkillCategory)
    onUpdateSkill(categoryName, skillName, newLevel);
  };

  const handleSkillRightClick = (e, categoryName, skillName, currentLevel) => {
    e.preventDefault();
    const newLevel = Math.max((currentLevel || 0) - 1, 0);
    onUpdateSkill(categoryName, skillName, newLevel);
  };

  const addCustomSkill = (categoryName, skillData) => {
    setCustomSkills(prev => ({
      ...prev,
      [categoryName]: [
        ...(prev[categoryName] || []),
        { ...skillData, isCustom: true }  // Mark as custom skill
      ]
    }));
    setIsModalOpen(false);
  };

  const removeCustomSkill = (categoryName, skillName) => {
    // Remove from custom skills
    setCustomSkills(prev => {
      const updated = { ...prev };
      if (updated[categoryName]) {
        updated[categoryName] = updated[categoryName].filter(
          skill => skill.name !== skillName
        );
        // Remove category if empty
        if (updated[categoryName].length === 0) {
          delete updated[categoryName];
        }
      }
      return updated;
    });
    
    // Remove skill data from parent component
    if (onRemoveSkill) {
      onRemoveSkill(categoryName, skillName);
    }
  };

  const getSkillLevel = (categoryName, skillName) => {
    return skillData[categoryName]?.[skillName] || 0;
  };

  const getTotalSkillPoints = () => {
    let total = 0;
    Object.values(skillData).forEach(category => {
      Object.values(category).forEach(level => {
        total += level;
      });
    });
    return total;
  };

  const getAllSkillsForCategory = (categoryName) => {
    const baseSkills = STARFIELD_SKILLS[categoryName]?.skills || [];
    const customCategorySkills = customSkills[categoryName] || [];
    return [...baseSkills, ...customCategorySkills];
  };

  return (
    <div className="skills-page">
      <div className="skills-header">
        <h2>Personal Development Skills</h2>
          <img
            src={carpenterGif}
            alt="Carpenter Paschalis Rathskellers"
            style={{
              display: 'inline-block',
              marginLeft: '16px',
              verticalAlign: 'middle',
              width: '115px', // 1.2 * 96px
              height: '115px', // 1.2 * 96px
              animation: 'floatLamp 2.2s infinite cubic-bezier(.4,0,.6,1)'
            }}
          />
        <div className="skills-stats">
          <div className="stat-item">
            <span className="stat-label">Total Skill Points:</span>
            <span className="stat-value">{getTotalSkillPoints()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{Math.floor(getTotalSkillPoints() / 10) + 1}</span>
          </div>
        </div>
        <button 
          className="add-skill-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Custom Skill
        </button>
      </div>

      <div className="skills-container">
        <div className="category-sidebar">
          {Object.entries(STARFIELD_SKILLS).map(([categoryName, categoryData]) => (
            <button
              key={categoryName}
              className={`category-button ${selectedCategory === categoryName ? 'active' : ''}`}
              onClick={() => setSelectedCategory(categoryName)}
            >
              <span className="category-icon">{categoryData.icon}</span>
              <span className="category-name">{categoryName}</span>
              <span className="category-progress">
                {Object.values(skillData[categoryName] || {}).reduce((sum, level) => sum + level, 0)}
              </span>
            </button>
          ))}
        </div>

        <div className="skills-grid">
          <SkillCategory
            categoryName={selectedCategory}
            categoryData={STARFIELD_SKILLS[selectedCategory]}
            skills={getAllSkillsForCategory(selectedCategory)}
            skillData={skillData[selectedCategory] || {}}
            onSkillClick={handleSkillClick}
            onSkillRightClick={handleSkillRightClick}
            getSkillLevel={getSkillLevel}
            onRemoveCustomSkill={removeCustomSkill}
          />
        </div>
      </div>

      {isModalOpen && (
        <SkillModal
          categories={Object.keys(STARFIELD_SKILLS)}
          onClose={() => setIsModalOpen(false)}
          onSave={addCustomSkill}
        />
      )}
    </div>
  );
}

export default SkillsPage;
