import React, { useState } from 'react';

function HealthMetrics({ data, onUpdate }) {
  const [metrics, setMetrics] = useState({
    weight: data.weight || '',
    height: data.height || '',
    bloodPressureSystolic: data.bloodPressureSystolic || '',
    bloodPressureDiastolic: data.bloodPressureDiastolic || '',
    restingHeartRate: data.restingHeartRate || '',
    averageSleep: data.averageSleep || '',
    exerciseFrequency: data.exerciseFrequency || '',
    waterIntake: data.waterIntake || '',
    stressLevel: data.stressLevel || 5,
    energyLevel: data.energyLevel || 5,
    ...data
  });

  const handleChange = (field, value) => {
    const updatedMetrics = { ...metrics, [field]: value };
    setMetrics(updatedMetrics);
    onUpdate(updatedMetrics);
  };

  const calculateBMI = () => {
    if (metrics.weight && metrics.height) {
      const bmi = metrics.weight / ((metrics.height / 100) ** 2);
      return bmi.toFixed(1);
    }
    return 'N/A';
  };

  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <div className="health-metrics">
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Physical Measurements</h3>
          <div className="metric-row">
            <label>Weight (kg):</label>
            <input
              type="number"
              value={metrics.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="70"
            />
          </div>
          <div className="metric-row">
            <label>Height (cm):</label>
            <input
              type="number"
              value={metrics.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="175"
            />
          </div>
          <div className="metric-result">
            <strong>BMI: {calculateBMI()} ({getBMICategory()})</strong>
          </div>
        </div>

        <div className="metric-card">
          <h3>Vital Signs</h3>
          <div className="metric-row">
            <label>Blood Pressure:</label>
            <div className="bp-inputs">
              <input
                type="number"
                value={metrics.bloodPressureSystolic}
                onChange={(e) => handleChange('bloodPressureSystolic', e.target.value)}
                placeholder="120"
              />
              <span>/</span>
              <input
                type="number"
                value={metrics.bloodPressureDiastolic}
                onChange={(e) => handleChange('bloodPressureDiastolic', e.target.value)}
                placeholder="80"
              />
            </div>
          </div>
          <div className="metric-row">
            <label>Resting Heart Rate (bpm):</label>
            <input
              type="number"
              value={metrics.restingHeartRate}
              onChange={(e) => handleChange('restingHeartRate', e.target.value)}
              placeholder="70"
            />
          </div>
        </div>

        <div className="metric-card">
          <h3>Lifestyle</h3>
          <div className="metric-row">
            <label>Average Sleep (hours):</label>
            <input
              type="number"
              step="0.5"
              value={metrics.averageSleep}
              onChange={(e) => handleChange('averageSleep', e.target.value)}
              placeholder="8"
            />
          </div>
          <div className="metric-row">
            <label>Exercise Frequency (times/week):</label>
            <input
              type="number"
              value={metrics.exerciseFrequency}
              onChange={(e) => handleChange('exerciseFrequency', e.target.value)}
              placeholder="3"
            />
          </div>
          <div className="metric-row">
            <label>Water Intake (liters/day):</label>
            <input
              type="number"
              step="0.1"
              value={metrics.waterIntake}
              onChange={(e) => handleChange('waterIntake', e.target.value)}
              placeholder="2.5"
            />
          </div>
        </div>

        <div className="metric-card">
          <h3>Wellness Levels</h3>
          <div className="metric-row">
            <label>Stress Level (1-10):</label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={metrics.stressLevel}
                onChange={(e) => handleChange('stressLevel', e.target.value)}
                className="wellness-slider stress"
              />
              <span className="slider-value">{metrics.stressLevel}</span>
            </div>
          </div>
          <div className="metric-row">
            <label>Energy Level (1-10):</label>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={metrics.energyLevel}
                onChange={(e) => handleChange('energyLevel', e.target.value)}
                className="wellness-slider energy"
              />
              <span className="slider-value">{metrics.energyLevel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="health-summary">
        <h3>Health Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">BMI Status:</span>
            <span className={`summary-value ${getBMICategory().toLowerCase()}`}>
              {getBMICategory()}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Activity Level:</span>
            <span className="summary-value">
              {getActivityLevel(metrics.exerciseFrequency)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Sleep Quality:</span>
            <span className="summary-value">
              {getSleepQuality(metrics.averageSleep)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Hydration:</span>
            <span className="summary-value">
              {getHydrationStatus(metrics.waterIntake)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getActivityLevel(frequency) {
  if (!frequency) return 'Unknown';
  if (frequency < 2) return 'Low';
  if (frequency < 4) return 'Moderate';
  if (frequency < 6) return 'High';
  return 'Very High';
}

function getSleepQuality(hours) {
  if (!hours) return 'Unknown';
  if (hours < 6) return 'Insufficient';
  if (hours < 7) return 'Below Optimal';
  if (hours <= 9) return 'Optimal';
  return 'Excessive';
}

function getHydrationStatus(liters) {
  if (!liters) return 'Unknown';
  if (liters < 2) return 'Low';
  if (liters < 3) return 'Good';
  return 'Excellent';
}

export default HealthMetrics;
