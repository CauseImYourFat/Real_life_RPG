import React, { useState, useEffect } from 'react';
import catflyRainbowGif from '../../dist/assets/catfly-rainbow.gif';

function MotivationPage({ skillData, lastLogin }) {
  const [dailyQuote, setDailyQuote] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [streakData, setStreakData] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    // Generate daily quote based on skill progress
    const quote = generateDailyQuote(skillData);
    setDailyQuote(quote);
    
    // Calculate achievements
    const newAchievements = calculateAchievements(skillData);
    setAchievements(newAchievements);
    
    // Update streak data
    updateStreakData();
  }, [skillData, lastLogin]);

  const updateStreakData = () => {
    const today = new Date().toDateString();
    const lastLoginDate = lastLogin ? new Date(lastLogin).toDateString() : null;
    
    let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    let longestStreak = parseInt(localStorage.getItem('longestStreak') || '0');
    
    if (lastLoginDate !== today) {
      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        localStorage.setItem('longestStreak', longestStreak.toString());
      }
      localStorage.setItem('currentStreak', currentStreak.toString());
    }
    
    setStreakData({ current: currentStreak, longest: longestStreak });
  };

  const generateShareableImage = () => {
    // Create canvas for shareable progress image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);
    
    // Title
    ctx.fillStyle = '#00d4aa';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Life RPG Progress', 50, 80);
    
    // Daily quote
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    const words = dailyQuote?.text.split(' ') || [];
    let line = '';
    let y = 150;
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 700 && line !== '') {
        ctx.fillText(line, 50, y);
        line = word + ' ';
        y += 30;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, 50, y);
    
    // Skill stats
    const totalSkills = getTotalSkillPoints(skillData);
    const level = Math.floor(totalSkills / 10) + 1;
    
    ctx.fillStyle = '#00d4aa';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Level ${level}`, 50, y + 80);
    ctx.fillText(`${totalSkills} Skill Points`, 50, y + 120);
    ctx.fillText(`${streakData.current} Day Streak`, 50, y + 160);
    
    // Convert to downloadable image
    const link = document.createElement('a');
    link.download = `life-rpg-progress-${new Date().toDateString()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="motivation-page">
      <div className="motivation-header">
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          Daily Motivation
            <img
            src={catflyRainbowGif}
            alt="Catfly Rainbow Mascot"
            style={{ width: '80px', height: '80px', filter: 'drop-shadow(0 0 8px #00d4aa)' }}
          />
        </h2>
        <div className="streak-info">
          <div className="streak-item">
            <span className="streak-value">{streakData.current}</span>
            <span className="streak-label">Day Streak</span>
          </div>
          <div className="streak-item">
            <span className="streak-value">{streakData.longest}</span>
            <span className="streak-label">Longest Streak</span>
          </div>
        </div>
      </div>

      {dailyQuote && (
        <div className="daily-quote-card">
          <div className="quote-content">
            <blockquote>"{dailyQuote.text}"</blockquote>
            <div className="quote-metadata">
              <span className="quote-category">Based on your {dailyQuote.category} progress</span>
              <span className="quote-author">- {dailyQuote.author}</span>
            </div>
          </div>
          <button className="share-btn" onClick={generateShareableImage}>
            📸 Share Progress
          </button>
        </div>
      )}

      <div className="achievements-section">
        <h3>Recent Achievements</h3>
        <div className="achievements-grid">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <span className="achievement-date">{achievement.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-achievements">
              <p>Start improving your skills to unlock achievements!</p>
            </div>
          )}
        </div>
      </div>

      <div className="progress-overview">
        <h3>Your Progress Overview</h3>
        <div className="progress-stats">
          <div className="stat-card">
            <div className="stat-value">{getTotalSkillPoints(skillData)}</div>
            <div className="stat-label">Total Skill Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.floor(getTotalSkillPoints(skillData) / 10) + 1}</div>
            <div className="stat-label">Current Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{getActiveSkillsCount(skillData)}</div>
            <div className="stat-label">Active Skills</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{getMasteredSkillsCount(skillData)}</div>
            <div className="stat-label">Mastered Skills</div>
          </div>
        </div>
      </div>

      <div className="skill-recommendations">
        <h3>Skill Recommendations</h3>
        <div className="recommendations-list">
          {getSkillRecommendations(skillData).map((rec, index) => (
            <div key={index} className="recommendation-card">
              <div className="rec-icon">{rec.icon}</div>
              <div className="rec-content">
                <h4>{rec.skill}</h4>
                <p>{rec.reason}</p>
                <div className="rec-category">{rec.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateDailyQuote(skillData) {
  const quotes = {
    Physical: [
      { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
      { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
      { text: "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.", author: "Buddha" }
    ],
    Social: [
      { text: "The way to gain a good reputation is to endeavor to be what you desire to appear.", author: "Socrates" },
      { text: "Communication is a skill that you can learn. It's like riding a bicycle or typing.", author: "Brian Tracy" },
      { text: "The art of communication is the language of leadership.", author: "James Humes" }
    ],
    Technology: [
      { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
      { text: "The science of today is the technology of tomorrow.", author: "Edward Teller" },
      { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" }
    ],
    Science: [
      { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
      { text: "The important thing is not to stop questioning.", author: "Albert Einstein" },
      { text: "Research is what I'm doing when I don't know what I'm doing.", author: "Wernher von Braun" }
    ],
    Combat: [
      { text: "It is better to be a warrior in a garden than a gardener in a war.", author: "Chinese Proverb" },
      { text: "The ultimate aim of martial arts is not having to use them.", author: "Miyamoto Musashi" },
      { text: "Victory belongs to the most persevering.", author: "Napoleon Bonaparte" }
    ],
    Piloting: [
      { text: "A ship in harbor is safe, but that is not what ships are built for.", author: "John A. Shedd" },
      { text: "The sky is not the limit, it's just the beginning.", author: "Unknown" },
      { text: "Flying is learning how to throw yourself at the ground and miss.", author: "Douglas Adams" }
    ]
  };

  // Find the category with most recent progress
  let topCategory = 'Physical';
  let maxPoints = 0;
  
  Object.entries(skillData).forEach(([category, skills]) => {
    const points = Object.values(skills).reduce((sum, level) => sum + level, 0);
    if (points > maxPoints) {
      maxPoints = points;
      topCategory = category;
    }
  });

  const categoryQuotes = quotes[topCategory] || quotes.Physical;
  // Deterministic quote selection: use user and date for seed
  let seed = 0;
  try {
    const user = localStorage.getItem('currentUser') || '';
    const today = new Date().toISOString().slice(0, 10);
    seed = user.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  } catch (e) {}
  const idx = categoryQuotes.length > 0 ? seed % categoryQuotes.length : 0;
  const selectedQuote = categoryQuotes[idx];
  return {
    ...selectedQuote,
    category: topCategory
  };
}

function calculateAchievements(skillData) {
  const achievements = [];
  const now = new Date().toLocaleDateString();
  
  // Check for various achievements
  Object.entries(skillData).forEach(([category, skills]) => {
    Object.entries(skills).forEach(([skillName, level]) => {
      if (level === 5) {
        achievements.push({
          icon: '🎖️',
          title: 'Intermediate Master',
          description: `Reached level 5 in ${skillName}`,
          date: now
        });
      }
      if (level === 10) {
        achievements.push({
          icon: '👑',
          title: 'Skill Master',
          description: `Mastered ${skillName}`,
          date: now
        });
      }
    });
  });

  const totalPoints = getTotalSkillPoints(skillData);
  if (totalPoints >= 50) {
    achievements.push({
      icon: '⭐',
      title: 'Skill Collector',
      description: 'Accumulated 50 skill points',
      date: now
    });
  }
  
  return achievements.slice(-5); // Return last 5 achievements
}

function getTotalSkillPoints(skillData) {
  let total = 0;
  Object.values(skillData).forEach(category => {
    Object.values(category).forEach(level => {
      total += level;
    });
  });
  return total;
}

function getActiveSkillsCount(skillData) {
  let count = 0;
  Object.values(skillData).forEach(category => {
    Object.values(category).forEach(level => {
      if (level > 0) count++;
    });
  });
  return count;
}

function getMasteredSkillsCount(skillData) {
  let count = 0;
  Object.values(skillData).forEach(category => {
    Object.values(category).forEach(level => {
      if (level === 10) count++;
    });
  });
  return count;
}

function getSkillRecommendations(skillData) {
  const recommendations = [
    { icon: '💪', skill: 'Fitness', reason: 'Build physical strength and endurance', category: 'Physical' },
    { icon: '🗣️', skill: 'Communication', reason: 'Essential for all relationships', category: 'Social' },
    { icon: '💻', skill: 'Programming', reason: 'High-demand skill in modern world', category: 'Technology' },
    { icon: '🧠', skill: 'Critical Thinking', reason: 'Improve decision-making abilities', category: 'Science' }
  ];
  
  return recommendations.slice(0, 3);
}

export default MotivationPage;
