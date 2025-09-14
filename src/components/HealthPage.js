import React, { useState } from 'react';
import BodyVisualization from './BodyVisualization';
import HealthMetrics from './HealthMetrics';
import HealthGoals from './HealthGoals';

function HealthPage({ healthData, onUpdateHealth }) {
  const [activeHealthTab, setActiveHealthTab] = useState('metrics');

  const healthTabs = [
    { id: 'metrics', name: 'Vital Signs', icon: '📊' },
    { id: 'body', name: 'Body Map', icon: '🫀' },
    { id: 'goals', name: 'Health Goals', icon: '🎯' },
    { id: 'history', name: 'History', icon: '📈' }
  ];

  return (
    <div className="health-page">
      <div className="health-header">
        <h2>Health & Anatomy Tracker</h2>
        <div className="health-status">
          <div className="status-indicator">
            <span className="status-label">Overall Health:</span>
            <span className="status-value">
              {calculateOverallHealth(healthData)}%
            </span>
          </div>
        </div>
      </div>

      <div className="health-nav">
        {healthTabs.map(tab => (
          <button
            key={tab.id}
            className={`health-tab ${activeHealthTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveHealthTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="health-content">
        {activeHealthTab === 'metrics' && (
          <HealthMetrics 
            data={healthData.metrics || {}}
            onUpdate={(data) => onUpdateHealth('metrics', data)}
          />
        )}
        
        {activeHealthTab === 'body' && (
          <BodyVisualization 
            data={healthData.body || {}}
            onUpdate={(data) => onUpdateHealth('body', data)}
          />
        )}
        
        {activeHealthTab === 'goals' && (
          <HealthGoals 
            data={healthData.goals || {}}
            onUpdate={(data) => onUpdateHealth('goals', data)}
          />
        )}
        
        {activeHealthTab === 'history' && (
          <div className="health-history">
            <h3>Health History Timeline</h3>
            <div className="timeline">
              {getHealthHistory(healthData).map((entry, index) => (
                <div key={index} className="timeline-entry">
                  <div className="timeline-date">{entry.date}</div>
                  <div className="timeline-content">
                    <h4>{entry.title}</h4>
                    <p>{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateOverallHealth(healthData) {
  const metrics = healthData.metrics || {};
  const goals = healthData.goals || {};
  
  // Simple health calculation based on key metrics
  let score = 100;
  
  // Adjust based on BMI if available
  if (metrics.weight && metrics.height) {
    const bmi = metrics.weight / ((metrics.height / 100) ** 2);
    if (bmi < 18.5 || bmi > 30) score -= 10;
    else if (bmi < 20 || bmi > 25) score -= 5;
  }
  
  // Adjust based on exercise frequency
  if (metrics.exerciseFrequency) {
    if (metrics.exerciseFrequency < 2) score -= 15;
    else if (metrics.exerciseFrequency < 3) score -= 5;
  }
  
  // Adjust based on sleep
  if (metrics.averageSleep) {
    if (metrics.averageSleep < 6 || metrics.averageSleep > 9) score -= 10;
    else if (metrics.averageSleep < 7 || metrics.averageSleep > 8) score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

function getHealthHistory(healthData) {
  // Generate sample history entries
  return [
    {
      date: new Date().toLocaleDateString(),
      title: 'Health Profile Created',
      description: 'Started tracking personal health metrics'
    }
  ];
}

export default HealthPage;
