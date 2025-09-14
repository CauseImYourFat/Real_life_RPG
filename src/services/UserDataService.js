// API-Based UserDataService - Handles backend communication for cross-device sync
class UserDataService {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    // Use production Railway URL when deployed, localhost for development
    this.baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '' 
      : 'https://realliferpg-production.up.railway.app';
  }

  // Get auth headers for API requests
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  // Check if user is logged in
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
      this.authToken = token;
      this.currentUser = user;
      return true;
    }
    
    return false;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser || localStorage.getItem('currentUser');
  }

  // Register new user
  async registerUser(username, password) {
    try {
      console.log('Registering user via API:', username);
      const response = await fetch(`${this.baseURL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store authentication info
      this.authToken = data.token;
      this.currentUser = data.user.username;
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', data.user.username);
      
      console.log('Registration successful:', data.user);
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async loginUser(username, password) {
    try {
      console.log('Logging in user via API:', username);
      const response = await fetch(`${this.baseURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store authentication info
      this.authToken = data.token;
      this.currentUser = data.user.username;
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', data.user.username);
      
      console.log('Login successful:', data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Initialize user (called on app start)
  async initializeUser(username) {
    if (this.isAuthenticated()) {
      this.currentUser = username || this.getCurrentUser();
      return await this.loadUserData();
    }
    return { skills: {}, health: {}, preferences: {} };
  }

  // Load user data from API
  async loadUserData() {
    if (!this.isAuthenticated()) {
      return { skills: {}, health: {}, preferences: {} };
    }

    try {
      const response = await fetch(`${this.baseURL}/api/user/data`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, logout user
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to load user data');
      }

      const data = await response.json();
      return {
        skills: data.skills || {},
        health: data.health || {},
        preferences: data.preferences || {}
      };
    } catch (error) {
      console.error('Load user data error:', error);
      // Return empty data if API fails
      return { skills: {}, health: {}, preferences: {} };
    }
  }

  // Save user data to API
  async saveUserData(data) {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/user/data`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          skills: data.skills || {},
          health: data.health || {},
          preferences: data.preferences || {}
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to save user data');
      }

      const result = await response.json();
      console.log('Data saved successfully:', result.message);
      return true;
    } catch (error) {
      console.error('Save user data error:', error);
      throw error;
    }
  }

  // Auto-save data (call this whenever data changes)
  async autoSave(data) {
    console.log('Auto-saving data...', data);
    try {
      return await this.saveUserData(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't throw error for auto-save failures to avoid disrupting user experience
      return false;
    }
  }

  // Save skill data specifically
  async saveSkillData(skillCategory, skillName, level) {
    const currentData = await this.loadUserData();
    
    if (!currentData.skills) currentData.skills = {};
    if (!currentData.skills[skillCategory]) currentData.skills[skillCategory] = {};
    
    currentData.skills[skillCategory][skillName] = level;
    
    await this.autoSave({ skills: currentData.skills });
    return currentData;
  }

  // Remove skill data
  async removeSkillData(skillCategory, skillName) {
    const currentData = await this.loadUserData();
    
    if (currentData.skills && currentData.skills[skillCategory]) {
      delete currentData.skills[skillCategory][skillName];
      
      // Remove category if empty
      if (Object.keys(currentData.skills[skillCategory]).length === 0) {
        delete currentData.skills[skillCategory];
      }
    }
    
    await this.autoSave({ skills: currentData.skills });
    return currentData;
  }

  // Save health data specifically
  async saveHealthData(category, data) {
    const currentData = await this.loadUserData();
    
    if (!currentData.health) currentData.health = {};
    currentData.health[category] = data;
    
    await this.autoSave({ health: currentData.health });
    return currentData;
  }

  // Update specific skill via API (optimized endpoint)
  async updateSkill(skillId, level, experience) {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/user/skills/${skillId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ level, experience })
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to update skill');
      }

      const result = await response.json();
      console.log('Skill updated successfully:', result.message);
      return true;
    } catch (error) {
      console.error('Update skill error:', error);
      return false;
    }
  }

  // Update health data via API (optimized endpoint)
  async updateHealthData(healthData) {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/user/health`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(healthData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to update health data');
      }

      const result = await response.json();
      console.log('Health data updated successfully:', result.message);
      return true;
    } catch (error) {
      console.error('Update health data error:', error);
      return false;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.authToken = null;
    this.currentUser = null;
  }

  // Check API health
  async checkAPIHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

const userDataService = new UserDataService();
export default userDataService;