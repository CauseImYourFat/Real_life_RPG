import React, { useState } from 'react';

function HealthGoals({ data, onUpdate }) {
  const [goals, setGoals] = useState(data.goals || []);
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
      
      setNewGoal({
        title: '',
        description: '',
        targetValue: '',
        currentValue: '',
        unit: '',
        deadline: '',
        category: 'fitness'
      });
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
        <h3>Health Goals</h3>
        <div className="goals-stats">
          <div className="stat">
            <span className="stat-value">{goals.length}</span>
            <span className="stat-label">Total Goals</span>
          </div>
          <div className="stat">
            <span className="stat-value">{goals.filter(g => g.completed).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length) : 0}%
            </span>
            <span className="stat-label">Avg Progress</span>
          </div>
        </div>
      </div>

      <div className="add-goal-form">
        <h4>Add New Goal</h4>
        <div className="form-grid">
          <input
            type="text"
            placeholder="Goal title"
            value={newGoal.title}
            onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
          />
          
          <select
            value={newGoal.category}
            onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
          >
            {goalCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Target value"
            value={newGoal.targetValue}
            onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
          />
          
          <input
            type="text"
            placeholder="Unit (kg, hours, etc.)"
            value={newGoal.unit}
            onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
          />
          
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
          />
          
          <button onClick={addGoal} className="add-goal-btn">
            Add Goal
          </button>
        </div>
        
        <textarea
          placeholder="Goal description..."
          value={newGoal.description}
          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
          rows="2"
        />
      </div>

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
