// Handles pet purchases, Gnee! point deduction, validation, atomic transactions, backend sync

class ShopService {
  // ...define shop logic, rollback, audit logging
}

module.exports = ShopService;

// ShopService.js
// Handles pet purchases, Gnee! point deduction, validation, atomic transactions, backend sync

const eventBus = require('./EventBus');
const userService = require('./UserService');
const petService = require('./PetService');

class ShopService {
  constructor() {
    this.items = {
      food: { price: 1 },
      pet: { price: 30 }
    };
    this.transactions = [];
  }

  buyItem(userId, type, itemData) {
    if (!userService.users[userId]) return false;
    const price = this.items[type]?.price || 0;
    if (userService.users[userId].gnee < price) return false;
    userService.addGnee(userId, -price);
    let itemId;
    if (type === 'pet') {
      itemId = petService.createPet(userId, itemData);
      userService.addPet(userId, itemId);
    } else if (type === 'food') {
      itemId = Date.now().toString();
      // ...add food to user inventory
    }
    this.transactions.push({ userId, type, itemId, price, timestamp: Date.now() });
    eventBus.emit('itemPurchased', { userId, type, itemId, price });
    return true;
  }

  sellItem(userId, type, itemId) {
    const price = Math.floor((this.items[type]?.price || 0) * 0.5);
    userService.addGnee(userId, price);
    eventBus.emit('itemSold', { userId, type, itemId, price });
    // ...remove item from user inventory
  }
}

module.exports = new ShopService();
