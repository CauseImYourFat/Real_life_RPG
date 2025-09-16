import dragonFireGif from '../assets/dragon-fire.gif';
import React, { useState, useEffect } from 'react';
import SkillsPage from './components/SkillsPage';
import HealthPage from './components/HealthPage';
import MotivationPage from './components/MotivationPage';
import ExportPage from './components/ExportPage';
import AuthPage from './components/AuthPage';
import UserMenu from './components/UserMenu';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import userDataService from './services/UserDataService';
import './styles/App.css';

function App() {
  // Image imports for Webpack
  const [activeTab, setActiveTab] = useState('skills');
  const [userData, setUserData] = useState({
    skills: {},
    health: {},
    preferences: { gneePoints: 0 },
    lastLogin: null
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDonut, setShowDonut] = useState(false);
  const [donutPosition, setDonutPosition] = useState({ top: 20, right: 20 });

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      const isAuth = await userDataService.isAuthenticated();
      if (isAuth) {
        const username = userDataService.getCurrentUser();
        setCurrentUser(username);
        setIsAuthenticated(true);
        try {
          // Load user data from API
          const data = await userDataService.loadUserData();
          setUserData({
            skills: data.skills || {},
            health: data.health || {},
            preferences: data.preferences || {},
            lastLogin: new Date().toISOString()
          });
        } catch (error) {
          // If loading fails, logout the user
          userDataService.logout();
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();

    // Forced save before refresh/close
    const handleBeforeUnload = async (e) => {
      if (isAuthenticated) {
        try {
          await userDataService.saveUserData(userData);
        } catch (err) {
          // Ignore errors to avoid blocking unload
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, userData]);

  const handleLogin = async (username) => {
    setLoading(true);
    try {
      // Load user data from API after successful login
      const data = await userDataService.loadUserData();
      setUserData({
        skills: data.skills || {},
        health: data.health || {},
        preferences: { ...(data.preferences || {}), gneePoints: data.preferences?.gneePoints || 0 },
        lastLogin: new Date().toISOString()
      });
      
      setCurrentUser(username);
      setIsAuthenticated(true);
      console.log(`Login complete: ${username}`);
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      // If loading fails after login, show error but keep user logged in
      alert('Warning: Failed to load your data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    userDataService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserData({
      skills: {},
      health: {},
      preferences: { gneePoints: 0 },
      lastLogin: null
    });
    setActiveTab('skills');
    console.log('User logged out');
  };

  const updateSkillData = async (skillCategory, skillName, level) => {
    try {
      const updatedData = await userDataService.saveSkillData(skillCategory, skillName, level);
        setUserData(prev => ({
          ...updatedData,
          preferences: {
            ...updatedData.preferences,
            gneePoints: (prev.preferences.gneePoints || 0) + 1
          }
        }));
        // Show donut animation
        triggerDonut();
    } catch (error) {
      console.error('Failed to update skill data:', error);
    }
  };

  const removeSkillData = async (skillCategory, skillName) => {
    try {
      const updatedData = await userDataService.removeSkillData(skillCategory, skillName);
      setUserData(prev => ({
        ...updatedData,
        preferences: {
          ...updatedData.preferences,
          gneePoints: (prev.preferences.gneePoints || 0) + 1
        }
      }));
        // Show donut animation
        triggerDonut();
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
        },
        preferences: {
          ...prev.preferences,
          gneePoints: (prev.preferences.gneePoints || 0) + 1
        }
      }));
        // Show donut animation
        triggerDonut();
    } catch (error) {
      console.error('Failed to update health data:', error);
    }
  // Donut animation trigger
  const triggerDonut = (e) => {
    // If event, use its clientX/clientY for position, else default to top right
    let top = 20, right = 20;
    if (e && e.clientX && e.clientY) {
      top = e.clientY;
      right = window.innerWidth - e.clientX;
    }
    setDonutPosition({ top, right });
    setShowDonut(true);
    setTimeout(() => setShowDonut(false), 1000);
  };
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
      {/* Sticky dragon-fire.gif at bottom left, only one instance */}
      <img
        src={dragonFireGif}
        alt="Dragon Fire"
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '120px',
          zIndex: 999,
          pointerEvents: 'none'
        }}
      />
      <header className="app-header">
        <div className="header-content" style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem', padding: '0.5em 1em 0.5em 1em'}}>
          <h1 className="app-title" style={{margin: 0, fontSize: '2em', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap'}}>
            Real Life
          </h1>
          <nav className="tab-navigation" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '2em'}}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{display: 'flex', alignItems: 'center', gap: '0.25em', padding: '0.4em 1em', fontSize: '1em'}}
              >
                <span className="tab-icon" style={{marginRight: '0.25em'}}>{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </nav>
          <div style={{marginLeft: 'auto'}}>
            <UserMenu 
              currentUser={currentUser} 
              onLogout={handleLogout}
              onShowProfile={() => setShowProfile(true)}
              onShowSettings={() => setShowSettings(true)}
            />
          </div>
        </div>
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

      {/* Profile Modal */}
      {showProfile && (
        <ProfilePage 
          currentUser={currentUser}
          userData={userData}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPage 
          currentUser={currentUser}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;