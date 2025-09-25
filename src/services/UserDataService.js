// API-Based UserDataService - Handles backend communication for cross-device sync
class UserDataService {
  // --- Tamagotchi API ---
  // Get full Tamagotchi data (shop, hive, XP, currentMascot, etc)
  async getTamagotchi() {
    if (!await this.isAuthenticated()) return null;
    try {
      const response = await fetch(`${this.baseURL}/api/user/tamagotchi`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to load Tamagotchi data');
      return await response.json();
    } catch (e) {
      console.error('getTamagotchi error:', e);
      return null;
    }
  }

  // Update Tamagotchi data (partial update)
  async updateTamagotchi(data) {
    if (!await this.isAuthenticated()) return false;
    try {
      const response = await fetch(`${this.baseURL}/api/user/tamagotchi`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update Tamagotchi data');
      return await response.json();
    } catch (e) {
      console.error('updateTamagotchi error:', e);
      return false;
    }
  }

  // Buy pet (add to hive/shop)
  async buyPet(mascotType) {
    // Get user data for Gnee! points and purchased pets
    const tama = await this.getTamagotchi();
    const purchased = tama?.purchased || {};
    const gneePoints = tama?.gneePoints || 0;
    const alreadyPicked = Object.keys(purchased).length > 0;
    if (!alreadyPicked) {
      // First pet is free
      return await this.updateTamagotchi({ action: 'buy', mascotType });
    } else if (gneePoints >= 5 && !purchased[mascotType]) {
      // Deduct Gnee! points and buy pet
      return await this.updateTamagotchi({ action: 'buy', mascotType, gneePoints: gneePoints - 5 });
    }
    return false;
  }

  // Edit pet (rename, change asset, etc)
  async editPet(mascotType, changes) {
    return await this.updateTamagotchi({ action: 'edit', mascotType, changes });
  }

  // Delete pet from hive
  async deletePet(mascotType) {
    return await this.updateTamagotchi({ action: 'delete', mascotType });
  }

  // Transfer pet to another user
  async transferPet(mascotType, toUser) {
    return await this.updateTamagotchi({ action: 'transfer', mascotType, toUser });
  }

  // Set current displayed mascot
  async setCurrentMascot(mascotType) {
    return await this.updateTamagotchi({ action: 'setCurrent', mascotType });
  }

  // ...existing code...

  // Get available shop pets
  async getShopPets() {
    if (!await this.isAuthenticated()) return [];
    try {
      const response = await fetch(`${this.baseURL}/api/shop/pets`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to load shop pets');
      return await response.json();
    } catch (e) {
      console.error('getShopPets error:', e);
      return [];
    }
  }

  // Get user's hive pets
  async getHivePets() {
    if (!await this.isAuthenticated()) return [];
    try {
      const response = await fetch(`${this.baseURL}/api/user/hive`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to load hive pets');
      return await response.json();
    } catch (e) {
      console.error('getHivePets error:', e);
      return [];
    }
  }
  // Save Tamagotchi data (mascotXP, purchased) to backend
  async saveTamagotchiData(mascotXP, purchased) {
    if (!this.isAuthenticated()) {
      return false;
    }
    try {
      const response = await fetch(`${this.baseURL}/api/user/tamagotchi`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ mascotXP, purchased })
      });
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to save Tamagotchi data');
      }
      const result = await response.json();
      console.log('Tamagotchi data saved:', result.message);
      return true;
    } catch (error) {
      console.error('Save Tamagotchi data error:', error);
      throw error;
    }
  }

  // Load Tamagotchi data from backend
  async loadTamagotchiData() {
    this.authToken = localStorage.getItem('authToken');
    this.currentUser = localStorage.getItem('currentUser');
    if (!this.authToken || !this.currentUser) {
      return { mascotXP: {}, purchased: {} };
    }
    try {
      const response = await fetch(`${this.baseURL}/api/user/tamagotchi`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to load Tamagotchi data');
      }
      const data = await response.json();
      return {
        mascotXP: data.mascotXP || {},
        purchased: data.purchased || {}
      };
    } catch (error) {
      console.error('Load Tamagotchi data error:', error);
      return { mascotXP: {}, purchased: {} };
    }
  }
  // Change username
  async changeUsername(newUsername) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    try {
      const response = await fetch(`${this.baseURL}/api/user/username`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ newUsername })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change username');
      }
      this.currentUser = newUsername;
      localStorage.setItem('currentUser', newUsername);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    try {
      const response = await fetch(`${this.baseURL}/api/user/password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update profile
  async updateProfile(profile) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    try {
      const response = await fetch(`${this.baseURL}/api/user/profile`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
  constructor() {
    // Always load token and user from localStorage on service creation
    this.authToken = localStorage.getItem('authToken');
    this.currentUser = localStorage.getItem('currentUser');
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

  // Check if user is logged in and token is valid
  async isAuthenticated() {
    // Always reload token and user from localStorage
    this.authToken = localStorage.getItem('authToken');
    this.currentUser = localStorage.getItem('currentUser');
    if (this.authToken && this.currentUser) {
      // Check token validity with a lightweight API call
      try {
        const response = await fetch(`${this.baseURL}/api/health`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
        if (response.ok) {
          return true;
        } else {
          this.logout();
          return false;
        }
      } catch (e) {
        this.logout();
        return false;
      }
    }
    return false;
  }
  // Call this on app load to auto-login if possible
  async autoLogin() {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      // Trigger login UI or redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return isAuth;
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
    if (await this.isAuthenticated()) {
      this.currentUser = username || this.getCurrentUser();
      return await this.loadUserData();
    }
    // If not authenticated, prompt for login (not sign up)
    return { requireLogin: true, skills: {}, health: {}, preferences: {} };
  }

  // Load user data from API
  async loadUserData() {
    // Always reload token from localStorage before API call
    this.authToken = localStorage.getItem('authToken');
    this.currentUser = localStorage.getItem('currentUser');
    if (!this.authToken || !this.currentUser) {
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
      console.log('[DEBUG] Loaded user data from cloud:', data);
      return {
        skills: data.skills || {},
        health: data.health || {},
        preferences: data.preferences || {},
        profile: data.profile || {},
        lastSaved: data.lastSaved || ''
      };
    } catch (error) {
      console.error('Load user data error:', error);
      // Return empty data if API fails
      return { skills: {}, health: {}, preferences: {}, profile: {}, lastSaved: '' };
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
          preferences: data.preferences || {},
          profile: data.profile || {}
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

  // Save skill data and preserve all other user data
  async saveSkillData(skillCategory, skillName, level) {
    const currentData = await this.loadUserData();
    if (!currentData.skills) currentData.skills = {};
    if (!currentData.skills[skillCategory]) currentData.skills[skillCategory] = {};
    currentData.skills[skillCategory][skillName] = level;
    // Save the full user data object
    await this.autoSave({
      skills: currentData.skills,
      health: currentData.health || {},
      preferences: currentData.preferences || {},
      profile: currentData.profile || {}
    });
    return currentData;
  }

  // Remove skill data and preserve all other user data
  async removeSkillData(skillCategory, skillName) {
    const currentData = await this.loadUserData();
    if (currentData.skills && currentData.skills[skillCategory]) {
      delete currentData.skills[skillCategory][skillName];
      // Remove category if empty
      if (Object.keys(currentData.skills[skillCategory]).length === 0) {
        delete currentData.skills[skillCategory];
      }
    }
    // Save the full user data object
    await this.autoSave({
      skills: currentData.skills,
      health: currentData.health || {},
      preferences: currentData.preferences || {},
      profile: currentData.profile || {}
    });
    return currentData;
  }

  // Save health data and preserve all other user data
  async saveHealthData(category, data) {
    const currentData = await this.loadUserData();
    if (!currentData.health) currentData.health = {};
    currentData.health[category] = data;
    // Save the full user data object
    await this.autoSave({
      skills: currentData.skills || {},
      health: currentData.health,
      preferences: currentData.preferences || {},
      profile: currentData.profile || {}
    });
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

  // Delete user account
  async deleteAccount(confirmText) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/user/delete`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ confirmText })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear local authentication data
      this.logout();
      
      console.log('Account deleted successfully');
      return data;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
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