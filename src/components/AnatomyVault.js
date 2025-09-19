import React, { useState } from 'react';

function AnatomyVault({ data, onUpdate }) {
  // This component can be used for more advanced anatomy features
  // For now, it redirects to the main BodyVisualization component
  
  return (
    <div className="anatomy-vault">
      <div className="vault-header">
        <h2>🏛️ Anatomy Vault</h2>
        <p>Advanced anatomy tracking and historical data analysis</p>
      </div>
      
      <div className="vault-features">
        <div className="feature-card">
          <h3>📊 Progress Tracking</h3>
          <p>View historical health data and trends over time</p>
        </div>
        
        <div className="feature-card">
          <h3>🔍 Detailed Analysis</h3>
          <p>Deep dive into specific body part conditions and recovery</p>
        </div>
        
        <div className="feature-card">
          <h3>📈 Health Metrics</h3>
          <p>Comprehensive health scoring and improvement recommendations</p>
        </div>
        
        <div className="feature-card">
          <h3>🎯 Goal Setting</h3>
          <p>Set and track health improvement goals for each body part</p>
        </div>
      </div>
      
      <div className="vault-note">
        <p>💡 <strong>Note:</strong> The full interactive anatomy system is available in the <strong>Health & Anatomy</strong> tab. This vault serves as a repository for advanced features and historical data analysis.</p>
      </div>
    </div>
  );
}

export default AnatomyVault;