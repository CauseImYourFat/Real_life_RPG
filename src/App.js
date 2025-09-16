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
  const [activeTab, setActiveTab] = useState('skills');
  const [userData, setUserData] = useState({
    skills: {},
    health: {},
    preferences: { gneePoints: 0 },
    lastLogin: null
  });
    const [showDonut, setShowDonut] = useState(false);
    const [donutPosition, setDonutPosition] = useState({ top: 20, right: 20 });
  const [showSettings, setShowSettings] = useState(false);

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
        }
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
        {/* Donut animation */}
        {showDonut && (
          <img
            src={require('../assets/donut.gif')}
            alt="Donut"
            style={{
              position: 'fixed',
              top: donutPosition.top,
              right: donutPosition.right,
              zIndex: 9999,
              width: '80px',
              pointerEvents: 'none',
              transition: 'opacity 0.2s',
              opacity: showDonut ? 1 : 0
            }}
          />
        )}
      {/* Persistent debug info for token and user */}
      <header className="app-header">
        <div className="header-content" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <h1 className="app-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            Real Life
            <img src={require('../assets/Gnee.png')} alt="Gnee" style={{height: '2.2em', verticalAlign: 'middle'}} />
            <span className="gnee-points" style={{background: '#222', color: '#fff', borderRadius: '1em', padding: '0.3em 0.8em', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1em', marginLeft: '0.5em', boxShadow: '0 0 6px #ff0'}}>
              Gnee!!'s Points: {userData.preferences.gneePoints || 0}
            </span>
          </h1>
          <UserMenu 
            currentUser={currentUser} 
            onLogout={handleLogout}
            onShowProfile={() => setShowProfile(true)}
            onShowSettings={() => setShowSettings(true)}
          />
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