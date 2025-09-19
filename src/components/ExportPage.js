import React, { useState } from 'react';

function ExportPage({ userData }) {
  const [exportFormat, setExportFormat] = useState('json');
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [lastExport, setLastExport] = useState(null);

  const exportFormats = [
    { id: 'json', name: 'JSON (AI-Friendly)', description: 'Structured format for AI analysis' },
    { id: 'csv', name: 'CSV (Spreadsheet)', description: 'For data analysis tools' },
    { id: 'txt', name: 'Text Report', description: 'Human-readable summary' },
    { id: 'xml', name: 'XML', description: 'Structured markup format' }
  ];

  const generateExportData = (format) => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalSkillPoints: getTotalSkillPoints(userData.skills),
        userLevel: Math.floor(getTotalSkillPoints(userData.skills) / 10) + 1,
        activeSkills: getActiveSkillsCount(userData.skills),
        masteredSkills: getMasteredSkillsCount(userData.skills)
      },
      skills: userData.skills || {},
      health: includePersonalData ? userData.health : {},
      preferences: userData.preferences || {},
      analytics: generateAnalytics(userData)
    };

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      
      case 'csv':
        return generateCSV(exportData);
      
      case 'txt':
        return generateTextReport(exportData);
      
      case 'xml':
        return generateXML(exportData);
      
      default:
        return JSON.stringify(exportData, null, 2);
    }
  };

  const downloadExport = () => {
    const data = generateExportData(exportFormat);
    const blob = new Blob([data], { type: getContentType(exportFormat) });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-rpg-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    link.click();
    
    URL.revokeObjectURL(url);
    setLastExport(new Date().toISOString());
  };

  const copyToClipboard = () => {
    const data = generateExportData(exportFormat);
    navigator.clipboard.writeText(data).then(() => {
      alert('Data copied to clipboard!');
    });
  };

  const generateAIPrompt = () => {
    const data = generateExportData('json');
    const aiPrompt = `Please analyze my personal development data and provide insights:

${data}

Please provide:
1. Strengths analysis based on my highest skill levels
2. Areas for improvement based on skill gaps
3. Personalized recommendations for next skills to develop
4. Progress trends and patterns you notice
5. Health correlations with skill development if applicable
6. Motivation strategies based on my current level and interests

Format your response in a clear, actionable manner with specific next steps I can take.`;

    navigator.clipboard.writeText(aiPrompt).then(() => {
      alert('AI analysis prompt copied to clipboard! Paste this into your preferred AI tool.');
    });
  };

  return (
    <div className="export-page">
      <div className="export-header">
        <h2>Data Export & AI Analysis</h2>
        <p>Export your life progress data for external analysis and backup</p>
      </div>

      <div className="export-options">
        <div className="format-selection">
          <h3>Export Format</h3>
          <div className="format-grid">
            {exportFormats.map(format => (
              <div
                key={format.id}
                className={`format-card ${exportFormat === format.id ? 'selected' : ''}`}
                onClick={() => setExportFormat(format.id)}
              >
                <h4>{format.name}</h4>
                <p>{format.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="export-settings">
          <h3>Export Settings</h3>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={includePersonalData}
                onChange={(e) => setIncludePersonalData(e.target.checked)}
              />
              Include personal health data
            </label>
          </div>
        </div>
      </div>

      <div className="export-preview">
        <h3>Data Preview</h3>
        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-value">{getTotalSkillPoints(userData.skills)}</span>
            <span className="stat-label">Total Skill Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(userData.skills || {}).length}</span>
            <span className="stat-label">Skill Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{getActiveSkillsCount(userData.skills)}</span>
            <span className="stat-label">Active Skills</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(userData.health || {}).length}</span>
            <span className="stat-label">Health Metrics</span>
          </div>
        </div>

        <div className="preview-content">
          <textarea
            value={generateExportData(exportFormat).substring(0, 1000) + '...'}
            readOnly
            rows="10"
          />
        </div>
      </div>

      <div className="export-actions">
        <button className="btn-primary" onClick={downloadExport}>
          📥 Download Export
        </button>
        <button className="btn-secondary" onClick={copyToClipboard}>
          📋 Copy to Clipboard
        </button>
        <button className="btn-ai" onClick={generateAIPrompt}>
          🤖 Generate AI Analysis Prompt
        </button>
      </div>

      <div className="ai-analysis-guide">
        <h3>AI Analysis Guide</h3>
        <div className="guide-content">
          <h4>How to use your exported data with AI:</h4>
          <ol>
            <li>Click "Generate AI Analysis Prompt" to copy a ready-made prompt</li>
            <li>Paste the prompt into your favorite AI tool (ChatGPT, Claude, etc.)</li>
            <li>Get personalized insights and recommendations</li>
            <li>Use the insights to plan your next skill development goals</li>
          </ol>
          
          <h4>Recommended AI Tools:</h4>
          <ul>
            <li><strong>ChatGPT:</strong> Great for general analysis and advice</li>
            <li><strong>Claude:</strong> Excellent for detailed personal development insights</li>
            <li><strong>Perplexity:</strong> Good for research-backed recommendations</li>
            <li><strong>Google Bard:</strong> Useful for creative development ideas</li>
          </ul>
        </div>
      </div>

      {lastExport && (
        <div className="export-history">
          <h3>Export History</h3>
          <div className="history-item">
            <span>Last export: {new Date(lastExport).toLocaleString()}</span>
            <span>Format: {exportFormat.toUpperCase()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function generateCSV(data) {
  let csv = 'Category,Skill,Level,Notes\n';
  
  Object.entries(data.skills).forEach(([category, skills]) => {
    Object.entries(skills).forEach(([skill, level]) => {
      csv += `"${category}","${skill}",${level},""\n`;
    });
  });
  
  return csv;
}

function generateTextReport(data) {
  let report = `LIFE RPG PROGRESS REPORT
Generated: ${new Date(data.metadata.exportDate).toLocaleString()}

OVERVIEW
========
Total Skill Points: ${data.metadata.totalSkillPoints}
Current Level: ${data.metadata.userLevel}
Active Skills: ${data.metadata.activeSkills}
Mastered Skills: ${data.metadata.masteredSkills}

SKILLS BY CATEGORY
==================
`;

  Object.entries(data.skills).forEach(([category, skills]) => {
    report += `\n${category.toUpperCase()}\n`;
    report += '-'.repeat(category.length) + '\n';
    Object.entries(skills).forEach(([skill, level]) => {
      const progress = '█'.repeat(level) + '░'.repeat(10 - level);
      report += `${skill}: [${progress}] ${level}/10\n`;
    });
  });

  if (data.analytics) {
    report += `\nANALYTICS\n=========\n`;
    report += `Strongest Category: ${data.analytics.strongestCategory}\n`;
    report += `Weakest Category: ${data.analytics.weakestCategory}\n`;
    report += `Recent Activity: ${data.analytics.recentActivity}\n`;
  }

  return report;
}

function generateXML(data) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<lifeRPGData>
  <metadata>
    <exportDate>${data.metadata.exportDate}</exportDate>
    <version>${data.metadata.version}</version>
    <totalSkillPoints>${data.metadata.totalSkillPoints}</totalSkillPoints>
    <userLevel>${data.metadata.userLevel}</userLevel>
  </metadata>
  <skills>
    ${Object.entries(data.skills).map(([category, skills]) => `
    <category name="${category}">
      ${Object.entries(skills).map(([skill, level]) => `
      <skill name="${skill}" level="${level}" />
      `).join('')}
    </category>
    `).join('')}
  </skills>
</lifeRPGData>`;
}

function generateAnalytics(userData) {
  const skills = userData.skills || {};
  const categoryTotals = {};
  
  Object.entries(skills).forEach(([category, categorySkills]) => {
    categoryTotals[category] = Object.values(categorySkills).reduce((sum, level) => sum + level, 0);
  });
  
  const sortedCategories = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a);
  
  return {
    strongestCategory: sortedCategories[0]?.[0] || 'None',
    weakestCategory: sortedCategories[sortedCategories.length - 1]?.[0] || 'None',
    categoryTotals,
    recentActivity: 'Data collection ongoing',
    recommendations: [
      'Focus on your weakest skill categories',
      'Maintain progress in your strongest areas',
      'Set specific skill level goals'
    ]
  };
}

function getContentType(format) {
  const types = {
    json: 'application/json',
    csv: 'text/csv',
    txt: 'text/plain',
    xml: 'application/xml'
  };
  return types[format] || 'text/plain';
}

function getTotalSkillPoints(skillData) {
  let total = 0;
  Object.values(skillData || {}).forEach(category => {
    Object.values(category).forEach(level => {
      total += level;
    });
  });
  return total;
}

function getActiveSkillsCount(skillData) {
  let count = 0;
  Object.values(skillData || {}).forEach(category => {
    Object.values(category).forEach(level => {
      if (level > 0) count++;
    });
  });
  return count;
}

function getMasteredSkillsCount(skillData) {
  let count = 0;
  Object.values(skillData || {}).forEach(category => {
    Object.values(category).forEach(level => {
      if (level === 10) count++;
    });
  });
  return count;
}

export default ExportPage;
