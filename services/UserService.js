// Manages user profiles, Gnee! points, owned pets, health/skills linkage, transaction history, notification controls

class UserService {
  // ...define user logic, guest/demo support, data versioning
}

module.exports = UserService;

// UserService.js
// Manages user profiles, Gnee! points, owned pets, health/skills linkage, transaction history, notification controls

const eventBus = require('./EventBus');

class UserService {
  constructor() {
    this.users = {};
  }

  createUser(userData) {
    const userId = Date.now().toString();
    this.users[userId] = { ...userData, gnee: 0, pets: [], health: 100, transactions: [] };
    eventBus.emit('userCreated', { userId, user: this.users[userId] });
    return userId;
  }

  addGnee(userId, amount) {
    if (!this.users[userId]) return;
    this.users[userId].gnee += amount;
    eventBus.emit('gneeChanged', { userId, gnee: this.users[userId].gnee });
  }

  addPet(userId, petId) {
    if (!this.users[userId]) return;
    this.users[userId].pets.push(petId);
    eventBus.emit('petAddedToUser', { userId, petId });
  }

  updateHealth(userId, health) {
    if (!this.users[userId]) return;
    this.users[userId].health = health;
    eventBus.emit('healthChanged', { userId, health });
  }

  getUser(userId) {
    return this.users[userId];
  }
}

module.exports = new UserService();
