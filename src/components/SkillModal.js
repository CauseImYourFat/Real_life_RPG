import React, { useState } from 'react';

function SkillModal({ categories, onClose, onSave }) {
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (skillName.trim() && skillDescription.trim()) {
      onSave(selectedCategory, {
        name: skillName.trim(),
        description: skillDescription.trim()
      });
      setSkillName('');
      setSkillDescription('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Custom Skill</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="skill-form">
          <div className="form-group">
            <label htmlFor="skillName">Skill Name:</label>
            <input
              id="skillName"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., Chess, Cooking, Photography"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="skillDescription">Description:</label>
            <textarea
              id="skillDescription"
              value={skillDescription}
              onChange={(e) => setSkillDescription(e.target.value)}
              placeholder="Describe what this skill involves..."
              rows="3"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="skillCategory">Category:</label>
            <select
              id="skillCategory"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SkillModal;
