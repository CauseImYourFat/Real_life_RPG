// Super Simple UserDataService - No APIs, just localStorage!
class UserDataService {
  constructor() {
    this.currentUser = null;
  }

  // Check if user is logged in
  isAuthenticated() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUser = user;
      return true;
    }
    return false;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser || localStorage.getItem('currentUser');
  }

  // Check if username exists (for registration validation)
  usernameExists(username) {
    const userKey = `user_${username}`;
    return localStorage.getItem(userKey) !== null;
  }

  // Register new user
  async registerUser(username, password) {
    if (this.usernameExists(username)) {
      throw new Error('Username already exists on this device');
    }
    
    const userKey = `user_${username}`;
    const initialData = {
      username: username,
      password: password, // In real app, this should be hashed
      skills: {},
      health: {},
      preferences: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(userKey, JSON.stringify(initialData));
    this.currentUser = username;
    localStorage.setItem('currentUser', username);
    
    return initialData;
  }

  // Login user
  async loginUser(username, password) {
    const userKey = `user_${username}`;
    const userData = localStorage.getItem(userKey);
    
    if (!userData) {
      // User doesn't exist on this device - create new profile
      console.log(`User ${username} not found on this device, creating new profile...`);
      return await this.registerUser(username, password);
    }
    
    const user = JSON.parse(userData);
    // Simple password check (in real app, use proper authentication)
    if (user.password !== password) {
      throw new Error('Invalid password');
    }
    
    this.currentUser = username;
    localStorage.setItem('currentUser', username);
    
    return user;
  }

  // Initialize user (called on app start)
  async initializeUser(username) {
    this.currentUser = username;
    return await this.loadUserData();
  }

  // Load user data
  async loadUserData() {
    const username = this.getCurrentUser();
    if (!username) return { skills: {}, health: {}, preferences: {} };
    
    const userKey = `user_${username}`;
    const userData = localStorage.getItem(userKey);
    
    if (userData) {
      const data = JSON.parse(userData);
      return {
        skills: data.skills || {},
        health: data.health || {},
        preferences: data.preferences || {}
      };
    }
    
    return { skills: {}, health: {}, preferences: {} };
  }

  // Save user data
  async saveUserData(data) {
    const username = this.getCurrentUser();
    if (!username) return false;
    
    const userKey = `user_${username}`;
    let existingData = localStorage.getItem(userKey);
    
    if (existingData) {
      const userData = JSON.parse(existingData);
      const updatedData = {
        ...userData,
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(userKey, JSON.stringify(updatedData));
      console.log('Data saved for user:', username, updatedData);
      return true;
    } else {
      // Create new user data if it doesn't exist
      const newUserData = {
        username: username,
        password: '', // Will be set during registration
        ...data,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(userKey, JSON.stringify(newUserData));
      console.log('New user data created:', username, newUserData);
      return true;
    }
  }

  // Auto-save data (call this whenever data changes)
  async autoSave(data) {
    console.log('Auto-saving data...', data);
    return await this.saveUserData(data);
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

  // Logout
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
  }
}

const userDataService = new UserDataService();
export default userDataService;