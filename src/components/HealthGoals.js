import React, { useState } from 'react';

function HealthGoals({ data, onUpdate }) {
  const [goals, setGoals] = useState(data.goals || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '',
    currentValue: '',
    unit: '',
    deadline: '',
    category: 'fitness'
  });

  const goalCategories = [
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'mental', name: 'Mental Health', icon: '🧠' },
    { id: 'sleep', name: 'Sleep', icon: '😴' },
    { id: 'medical', name: 'Medical', icon: '🏥' }
  ];

  const addGoal = () => {
    if (newGoal.title && newGoal.targetValue) {
      const goal = {
        ...newGoal,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        completed: false
      };
      
      const updatedGoals = [...goals, goal];
      setGoals(updatedGoals);
      onUpdate({ ...data, goals: updatedGoals });
      
      // Reset form and hide it
      setNewGoal({
        title: '',
        description: '',
        targetValue: '',
        currentValue: '',
        unit: '',
        deadline: '',
        category: 'fitness'
      });
      setShowAddForm(false);
    }
  };

  const updateGoal = (goalId, field, value) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, [field]: value } : goal
    );
    setGoals(updatedGoals);
    onUpdate({ ...data, goals: updatedGoals });
  };

  const deleteGoal = (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    onUpdate({ ...data, goals: updatedGoals });
  };

  const calculateProgress = (goal) => {
    if (!goal.targetValue || !goal.currentValue) return 0;
    return Math.min(100, (parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100);
  };

  const getGoalsByCategory = (categoryId) => {
    return goals.filter(goal => goal.category === categoryId);
  };

  return (
    <div className="health-goals">
      <div className="goals-header">
        <h3>🎯 Health Goals</h3>
        <button 
          className="add-goal-toggle-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Goal'}
        </button>
      </div>

      <div className="goals-stats">
        <div className="stat-card">
          <span className="stat-value">{goals.length}</span>
          <span className="stat-label">Total Goals</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{goals.filter(g => g.completed).length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length) : 0}%
          </span>
          <span className="stat-label">Avg Progress</span>
        </div>
      </div>

      {showAddForm && (
        <div className="add-goal-form">
          <h4>✨ Create New Goal</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Goal Title *</label>
              <input
                type="text"
                placeholder="e.g., Lose 10kg, Run 5km daily"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                className="form-select"
              >
                {goalCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Target Value *</label>
              <input
                type="number"
                placeholder="Target amount"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                placeholder="kg, hours, km, etc."
                value={newGoal.unit}
                onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                placeholder="Describe your goal and motivation..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                rows="2"
                className="form-textarea"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              onClick={addGoal} 
              className="add-goal-btn"
              disabled={!newGoal.title || !newGoal.targetValue}
            >
              🎯 Create Goal
            </button>
            <button 
              onClick={() => setShowAddForm(false)} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="goals-by-category">
        {goalCategories.map(category => {
          const categoryGoals = getGoalsByCategory(category.id);
          if (categoryGoals.length === 0) return null;
          
          return (
            <div key={category.id} className="goal-category">
              <h4>
                <span className="category-icon">{category.icon}</span>
                {category.name} Goals
              </h4>
              
              <div className="goals-list">
                {categoryGoals.map(goal => (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header">
                      <h5>{goal.title}</h5>
                      <button 
                        className="delete-goal"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        ×
                      </button>
                    </div>
                    
                    {goal.description && (
                      <p className="goal-description">{goal.description}</p>
                    )}
                    
                    <div className="goal-progress">
                      <div className="progress-inputs">
                        <input
                          type="number"
                          placeholder="Current"
                          value={goal.currentValue}
                          onChange={(e) => updateGoal(goal.id, 'currentValue', e.target.value)}
                        />
                        <span>/</span>
                        <span>{goal.targetValue} {goal.unit}</span>
                      </div>
                      
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${calculateProgress(goal)}%` }}
                        ></div>
                      </div>
                      
                      <div className="progress-text">
                        {calculateProgress(goal).toFixed(1)}% Complete
                      </div>
                    </div>
                    
                    {goal.deadline && (
                      <div className="goal-deadline">
                        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        <span className={`days-remaining ${getDaysRemaining(goal.deadline) <= 7 ? 'urgent' : ''}`}>
                          {getDaysRemaining(goal.deadline)} days remaining
                        </span>
                      </div>
                    )}
                    
                    <div className="goal-actions">
                      <button
                        className={`complete-btn ${goal.completed ? 'completed' : ''}`}
                        onClick={() => updateGoal(goal.id, 'completed', !goal.completed)}
                      >
                        {goal.completed ? '✓ Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getDaysRemaining(deadline) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default HealthGoals;

// Add this CSS to your main stylesheet or component styles
const healthGoalsStyles = `
  .health-goals {
    padding: 2rem;
    background: #2a2a2a;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .goals-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .goals-header h3 {
    color: white;
    margin: 0;
    font-size: 1.5rem;
  }

  .add-goal-toggle-btn {
    background: #00d4aa;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .add-goal-toggle-btn:hover {
    background: #00b894;
    transform: translateY(-1px);
  }

  .goals-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #00d4aa;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: #aaa;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .add-goal-form {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .add-goal-form h4 {
    color: white;
    margin: 0 0 1.5rem 0;
    font-size: 1.2rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    color: #ccc;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .form-input, .form-select, .form-textarea {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 0.75rem;
    color: white;
    font-size: 0.95rem;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: #00d4aa;
    box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2);
  }

  .form-input::placeholder, .form-textarea::placeholder {
    color: #777;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .add-goal-btn {
    background: #00d4aa;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .add-goal-btn:hover:not(:disabled) {
    background: #00b894;
    transform: translateY(-1px);
  }

  .add-goal-btn:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .cancel-btn {
    background: transparent;
    color: #aaa;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .goals-stats {
      grid-template-columns: 1fr;
    }
    
    .form-actions {
      flex-direction: column;
    }
  }
`;
