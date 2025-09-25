// Listens for health/skills changes, calculates boosts, updates pet XP/level

class HealthSkillsService {
  // ...define health/skills logic
}

module.exports = HealthSkillsService;

// HealthSkillsService.js
// Listens for health/skills changes, calculates boosts, updates pet XP/level

const eventBus = require('./EventBus');
const petService = require('./PetService');
const userService = require('./UserService');

class HealthSkillsService {
  constructor() {
    eventBus.on('healthChanged', ({ userId, health }) => {
      this.applyHealthImpact(userId, health);
    });
  }

  applyHealthImpact(userId, health) {
    const user = userService.getUser(userId);
    if (!user) return;
    user.pets.forEach(petId => {
      const pet = petService.getPet(petId);
      if (pet) {
        pet.performance = health >= 100 ? 1 : Math.max(0.5, health / 100);
        eventBus.emit('petPerformanceChanged', { petId, performance: pet.performance });
      }
    });
  }
}

module.exports = new HealthSkillsService();
