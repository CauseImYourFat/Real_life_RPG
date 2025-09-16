// Trigger redeploy: harmless comment for Railway
import React, { useState, useEffect } from 'react';
import userDataService from '../services/UserDataService';

function ProfilePage({ onClose, currentUser, userData }) {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState('');
  const [profileData, setProfileData] = useState({
    description: '',
    profileImage: '',
    level: 1,
    totalExperience: 0,
    achievements: []
  });

  useEffect(() => {
    // Calculate user level and experience from skills
    let totalExp = 0;
    let skillCount = 0;

    Object.values(userData.skills || {}).forEach(category => {
      Object.values(category).forEach(level => {
        totalExp += parseInt(level) || 0;
        skillCount++;
      });
    });

    const averageLevel = skillCount > 0 ? Math.floor(totalExp / skillCount) : 1;
    const userLevel = Math.max(1, Math.min(100, averageLevel));

    setProfileData(prev => ({
      ...prev,
      level: userLevel,
      totalExperience: totalExp
    }));
  }, [userData]);

  const getSkillSummary = () => {
    const skills = userData.skills || {};
    const categories = Object.keys(skills);
    const topSkills = [];

    categories.forEach(category => {
      Object.entries(skills[category]).forEach(([skillName, level]) => {
        topSkills.push({ name: skillName, level: parseInt(level) || 0, category });
      });
    });

    return topSkills.sort((a, b) => b.level - a.level).slice(0, 5);
  };

  const getHealthSummary = () => {
    const health = userData.health || {};
    const categories = Object.keys(health);
    return categories.length;
  };

  const getBodyPartStatus = (partName) => {
    const skills = userData.skills || {};
    const health = userData.health || {};
    
    // Map body parts to relevant skills/health data
    const partMapping = {
      head: ['Programming', 'Learning', 'Reading', 'Mental Health'],
      arms: ['Strength Training', 'Rock Climbing', 'Swimming', 'Upper Body'],
      body: ['Cardio', 'Core Strength', 'Fitness', 'Overall Health'],
      legs: ['Running', 'Cycling', 'Leg Day', 'Lower Body']
    };

    const relevantSkills = partMapping[partName] || [];
    let totalLevel = 0;
    let count = 0;

    // Check skills
    Object.values(skills).forEach(category => {
      Object.entries(category).forEach(([skillName, level]) => {
        if (relevantSkills.some(rs => skillName.toLowerCase().includes(rs.toLowerCase()))) {
          totalLevel += parseInt(level) || 0;
          count++;
        }
      });
    });

    // Check health data
    Object.keys(health).forEach(healthCategory => {
      if (relevantSkills.some(rs => healthCategory.toLowerCase().includes(rs.toLowerCase()))) {
        count++;
      }
    });

    const averageLevel = count > 0 ? Math.floor(totalLevel / count) : 0;
    
    if (averageLevel >= 8) return 'excellent';
    if (averageLevel >= 6) return 'good';
    if (averageLevel >= 4) return 'average';
    if (averageLevel >= 2) return 'poor';
    return 'untrained';
  };

  const getLevelColor = (level) => {
    if (level >= 80) return '#ffd700'; // Gold
    if (level >= 60) return '#c0392b'; // Red
    if (level >= 40) return '#8e44ad'; // Purple
    if (level >= 20) return '#3498db'; // Blue
    if (level >= 10) return '#27ae60'; // Green
    return '#95a5a6'; // Gray
  };

  const topSkills = getSkillSummary();
  const healthCategories = getHealthSummary();

  const handleAvatarClick = () => setShowAvatarDialog(true);
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewProfileImage(ev.target.result);
        setProfileData(prev => ({ ...prev, profileImage: ev.target.result }));
        setShowAvatarDialog(false);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
  return (
    <div className="profile-page">
      <div className="profile-overlay" onClick={onClose}></div>
      <div className="profile-container">
        <div className="profile-header">
          <h2>👤 Character Profile</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="profile-content">
          {/* Character Stats Panel */}
          <div className="character-stats">
            <div className="character-info">
              <div className="character-avatar" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" />
                ) : (
                  <div className="default-avatar">👤</div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#00d4aa', textAlign: 'center' }}>Edit</div>
              </div>
              {showAvatarDialog && (
                <div className="avatar-dialog" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#222', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px #000', textAlign: 'center' }}>
                    <h3>Change Profile Picture</h3>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                    <button onClick={() => setShowAvatarDialog(false)} style={{ marginTop: '1rem' }}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="character-details">
                <h3>{currentUser}</h3>
                <div className="level-badge" style={{ backgroundColor: getLevelColor(profileData.level) }}>
                  Level {profileData.level}
                </div>
                <div className="experience">
                  <span>Total Experience: {profileData.totalExperience}</span>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-icon">⚔️</span>
                <span className="stat-label">Skills Mastered</span>
                <span className="stat-value">{topSkills.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <span className="stat-label">Health Areas</span>
                <span className="stat-value">{healthCategories}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <span className="stat-label">Achievements</span>
                <span className="stat-value">{profileData.achievements.length}</span>
              </div>
            </div>
          </div>

          {/* Body Visualization with Edit Button */}
          <div className="body-visualization">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, paddingRight: '2.5rem' }}>⚡ Anatomy & Condition</h4>
              <button className="edit-anatomy-btn" title="Edit Anatomy" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', background: 'none', border: 'none', color: '#00d4aa', cursor: 'pointer', zIndex: 2 }}>✏️ Edit</button>
            </div>
            <div className="body-container">
              <div style={{ position: 'relative', width: '300px', height: '420px' }}>
                <img src="/image/anatomy/full body 5 1303.png" alt="Anatomy" style={{ width: '300px', height: '420px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }} />
                {/* Overlay status circles for body parts */}
                <div style={{ position: 'absolute', left: '135px', top: '35px' }}>
                  <div className={`status-circle ${getBodyPartStatus('head')}`} title="Head/Brain" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,0.3)', margin: 0 }}></div>
                </div>
                <div style={{ position: 'absolute', left: '135px', top: '160px' }}>
                  <div className={`status-circle ${getBodyPartStatus('body')}`} title="Core/Body" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,0.3)', margin: 0 }}></div>
                </div>
                <div style={{ position: 'absolute', left: '60px', top: '120px' }}>
                  <div className={`status-circle ${getBodyPartStatus('arms')}`} title="Arms" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,0.3)', margin: 0 }}></div>
                </div>
                <div style={{ position: 'absolute', left: '210px', top: '120px' }}>
                  <div className={`status-circle ${getBodyPartStatus('arms')}`} title="Arms" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,0.3)', margin: 0 }}></div>
                </div>
                <div style={{ position: 'absolute', left: '100px', top: '340px' }}>
                  <div className={`status-circle ${getBodyPartStatus('legs')}`} title="Legs" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,0.3)', margin: 0 }}></div>
                </div>
                <div style={{ position: 'absolute', left: '170px', top: '340px' }}>
                  <div className={`status-circle ${getBodyPartStatus('legs')}`} title="Legs" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #fff', background: 'rgba(0,0,0,0.3)', margin: 0 }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panels */}
          <div className="skills-overview">
            <h4>⚔️ Skills Summary</h4>
            <div className="skills-list">
              {topSkills.length > 0 ? (
                topSkills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-rank">#{index + 1}</div>
                    <div className="skill-info">
                      <div className="skill-name">{skill.name}</div>
                      <div className="skill-category">{skill.category}</div>
                    </div>
                    <div className="skill-level" style={{ color: getLevelColor(skill.level) }}>
                      Level {skill.level}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-skills">
                  <p>🎯 Start adding skills to see your progress!</p>
                  <p>Visit the Skills tab to begin your journey.</p>
                </div>
              )}
            </div>
            <div className="summary-panel">
              <h5>❤️ Health & Anatomy</h5>
              <div className="summary-content">
                <div className="health-summary-item">
                  <span className="summary-label">Health Areas:</span>
                  <span className="summary-value">{healthCategories}</span>
                </div>
                <div className="health-summary-item">
                  <span className="summary-label">Body Status:</span>
                  <div className="body-status-circles">
                    <div className={`status-circle ${getBodyPartStatus('head')}`} title="Head/Brain"></div>
                    <div className={`status-circle ${getBodyPartStatus('body')}`} title="Core/Body"></div>
                    <div className={`status-circle ${getBodyPartStatus('arms')}`} title="Arms"></div>
                    <div className={`status-circle ${getBodyPartStatus('legs')}`} title="Legs"></div>
                  </div>
                </div>
              </div>
              
              <h5>🌟 Daily Motivation</h5>
              <div className="summary-content">
                <div className="motivation-summary">
                  <div className="motivation-item">
                    <span className="summary-label">Current Streak:</span>
                    <span className="summary-value">0 days</span>
                  </div>
                  <div className="motivation-item">
                    <span className="summary-label">Weekly Goal:</span>
                    <span className="summary-value">5/7 days</span>
                  </div>
                  <div className="motivation-quote">
                    <p>"Every small step counts towards your greater journey! 🚀"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Character Description */}
          <div className="character-description">
            <h4>📜 Character Bio</h4>
            <div className="description-content">
              {profileData.description ? (
                <p>{profileData.description}</p>
              ) : (
                <div className="no-description">
                  <p>✍️ No character description yet.</p>
                  <p>Add one in Settings → Profile to personalize your character!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
        }

        .profile-container {
          position: relative;
          background: #2a2a2a;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          width: 95vw;
          max-width: 1000px;
          height: 90vh;
          max-height: 700px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .profile-header h2 {
          margin: 0;
          color: white;
          font-size: 1.4rem;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .close-button:hover {
          opacity: 1;
        }

        .profile-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: row;
          gap: 2rem;
          min-height: 600px;
        }

        .character-stats {
          flex: 1 1 350px;
          min-width: 300px;
        }

        .body-visualization {
          flex: 1 1 350px;
          min-width: 300px;
        }

        .skills-overview {
          flex: 1 1 350px;
          min-width: 300px;
        }

        .character-description {
          width: 100%;
          margin-top: 2rem;
        }

        .character-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .character-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #00d4aa;
          background: rgba(255, 255, 255, 0.1);
        }

        .character-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .default-avatar {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .character-details h3 {
          margin: 0 0 0.5rem 0;
          color: white;
          font-size: 1.3rem;
        }

        .level-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .experience {
          color: #aaa;
          font-size: 0.9rem;
        }

        .quick-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          font-size: 1.2rem;
          width: 30px;
          text-align: center;
        }

        .stat-label {
          flex: 1;
          color: white;
          font-weight: 500;
        }

        .stat-value {
          color: #00d4aa;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .body-visualization {
          grid-area: body;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .body-visualization h4 {
          color: white;
          margin: 0 0 1.5rem 0;
          text-align: center;
          font-size: 1.2rem;
        }

        .body-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .body-svg {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          width: 350px;
          height: 525px;
          max-width: 100%;
        }

        .body-part {
          transition: all 0.3s ease;
          cursor: pointer;
          stroke: rgba(255, 255, 255, 0.3);
          stroke-width: 2;
        }

        .body-part.excellent {
          fill: #27ae60;
        }

        .body-part.good {
          fill: #f39c12;
        }

        .body-part.average {
          fill: #3498db;
        }

        .body-part.poor {
          fill: #e74c3c;
        }

        .body-part.untrained {
          fill: #95a5a6;
        }

        .body-part:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }

        .body-text {
          fill: white;
          font-size: 16px;
          pointer-events: none;
        }

        .skills-overview h4 {
          color: white;
          margin: 0 0 1rem 0;
        }

        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .skill-rank {
          background: #00d4aa;
          color: white;
          font-weight: bold;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .skill-info {
          flex: 1;
        }

        .skill-name {
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .skill-category {
          color: #aaa;
          font-size: 0.8rem;
        }

        .skill-level {
          font-weight: bold;
          font-size: 0.9rem;
        }

        .no-skills, .no-description {
          text-align: center;
          color: #aaa;
          font-style: italic;
          padding: 2rem;
        }

        .summary-panel {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-panel h5 {
          color: white;
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .health-summary-item, .motivation-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .summary-label {
          color: #aaa;
          font-size: 0.9rem;
        }

        .summary-value {
          color: #00d4aa;
          font-weight: bold;
          font-size: 0.95rem;
        }

        .body-status-circles {
          display: flex;
          gap: 0.5rem;
        }

        .status-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .status-circle.excellent {
          background: #27ae60;
          box-shadow: 0 0 8px rgba(39, 174, 96, 0.5);
        }

        .status-circle.good {
          background: #f39c12;
          box-shadow: 0 0 8px rgba(243, 156, 18, 0.5);
        }

        .status-circle.average {
          background: #3498db;
          box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
        }

        .status-circle.poor {
          background: #e74c3c;
          box-shadow: 0 0 8px rgba(231, 76, 60, 0.5);
        }

        .status-circle.untrained {
          background: #95a5a6;
        }

        .motivation-summary {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .motivation-quote {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(0, 212, 170, 0.1);
          border-left: 3px solid #00d4aa;
          border-radius: 5px;
        }

        .motivation-quote p {
          margin: 0;
          color: #ccc;
          font-style: italic;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .character-description h4 {
          color: white;
          margin: 0 0 1rem 0;
        }

        .description-content {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
        }

        .description-content p {
          color: white;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .profile-container {
            width: 95vw;
            height: 95vh;
          }

          .profile-content {
            display: flex;
            flex-direction: column;
            grid-template-columns: none;
            grid-template-areas: none;
            gap: 1.5rem;
            padding: 1rem;
          }

          .body-svg {
            width: 280px;
            height: 420px;
          }

          .character-info {
            flex-direction: column;
            text-align: center;
          }

          .body-visualization {
            order: 1;
          }

          .character-stats {
            order: 2;
          }

          .skills-overview {
            order: 3;
          }

          .character-description {
            order: 4;
          }
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;