import React, { useState, useEffect } from 'react';
import SkillsPage from './components/SkillsPage';
import HealthPage from './components/HealthPage';
import MotivationPage from './components/MotivationPage';
import ExportPage from './components/ExportPage';
import AuthPage from './components/AuthPage';
import UserMenu from './components/UserMenu';
import userDataService from './services/UserDataService';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('skills');
  const [userData, setUserData] = useState({
    skills: {},
    health: {},
    preferences: {},
    lastLogin: null
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple auto-login check
    const checkAuth = async () => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        setCurrentUser(currentUser);
        setIsAuthenticated(true);
        console.log(`Auto-login: ${currentUser}`);
        
        // Load user data
        const userKey = `user_${currentUser}`;
        const userData = localStorage.getItem(userKey);
        if (userData) {
          const data = JSON.parse(userData);
          setUserData({
            skills: data.skills || {},
            health: data.health || {},
            preferences: data.preferences || {},
            lastLogin: new Date().toISOString()
          });
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (username) => {
    setLoading(true);
    try {
      // Simple login - just load user data from localStorage
      const userKey = `user_${username}`;
      const userData = localStorage.getItem(userKey);
      
      if (userData) {
        const data = JSON.parse(userData);
        setUserData({
          skills: data.skills || {},
          health: data.health || {},
          preferences: data.preferences || {},
          lastLogin: new Date().toISOString()
        });
      }
      
      setCurrentUser(username);
      setIsAuthenticated(true);
      console.log(`Login complete: ${username}`);
      
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserData({
      skills: {},
      health: {},
      preferences: {},
      lastLogin: null
    });
    setActiveTab('skills');
    console.log('User logged out');
  };

  const updateSkillData = async (skillCategory, skillName, level) => {
    try {
      const updatedData = await userDataService.saveSkillData(skillCategory, skillName, level);
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to update skill data:', error);
    }
  };

  const removeSkillData = async (skillCategory, skillName) => {
    try {
      const updatedData = await userDataService.removeSkillData(skillCategory, skillName);
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to remove skill data:', error);
    }
  };

  const updateHealthData = async (category, data) => {
    try {
      await userDataService.saveHealthData(category, data);
      setUserData(prev => ({
        ...prev,
        health: {
          ...prev.health,
          [category]: data
        }
      }));
    } catch (error) {
      console.error('Failed to update health data:', error);
    }
  };

  const tabs = [
    { id: 'skills', name: 'Skills', icon: '⚔️' },
    { id: 'health', name: 'Health & Anatomy', icon: '❤️' },
    { id: 'motivation', name: 'Daily Motivation', icon: '🌟' },
    { id: 'export', name: 'Data Export', icon: '📊' }
  ];

  // Show loading screen
  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h1>Real-Life RPG</h1>
          <div className="loading-spinner"></div>
          <p>Loading your personal development journey...</p>
        </div>
      </div>
    );
  }

  // Show authentication if not logged in
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎮 Life RPG</h1>
          <UserMenu currentUser={currentUser} onLogout={handleLogout} />
        </div>
        <nav className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="app-content">
        {activeTab === 'skills' && (
          <SkillsPage 
            skillData={userData.skills} 
            onUpdateSkill={updateSkillData}
            onRemoveSkill={removeSkillData}
          />
        )}
        {activeTab === 'health' && (
          <HealthPage 
            healthData={userData.health} 
            onUpdateHealth={updateHealthData}
          />
        )}
        {activeTab === 'motivation' && (
          <MotivationPage 
            skillData={userData.skills}
            lastLogin={userData.lastLogin}
          />
        )}
        {activeTab === 'export' && (
          <ExportPage userData={userData} />
        )}
      </main>
    </div>
  );
}

export default App;