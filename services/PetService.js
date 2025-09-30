// Handles pet entities, XP, levels, actions, status, and asset references

class PetService {
  // ...define pet logic, growth, unlocks
}

module.exports = PetService;

// PetService.js
// Handles pet entities, XP, levels, actions, status, and asset references

const eventBus = require('./EventBus');

class PetService {
  constructor() {
    this.pets = {};
  }

  createPet(userId, petData) {
    const petId = Date.now().toString();
    this.pets[petId] = { ...petData, owner: userId, xp: 0, level: 1, actions: ['default'] };
    eventBus.emit('petCreated', { userId, petId, pet: this.pets[petId] });
    return petId;
  }

  addXP(petId, amount) {
    if (!this.pets[petId]) return;
    this.pets[petId].xp += amount;
    if (this.pets[petId].xp >= this.getXPForNextLevel(this.pets[petId].level)) {
      this.pets[petId].level++;
      eventBus.emit('petLevelUp', { petId, level: this.pets[petId].level });
    }
  }

  getXPForNextLevel(level) {
    return level * 100;
  }

  unlockAction(petId, action) {
    if (!this.pets[petId]) return;
    if (!this.pets[petId].actions.includes(action)) {
      this.pets[petId].actions.push(action);
      eventBus.emit('actionUnlocked', { petId, action });
    }
  }

  getPet(petId) {
    return this.pets[petId];
  }
}

module.exports = new PetService();
