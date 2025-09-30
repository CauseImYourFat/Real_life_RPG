// Delivers/logs all events to users, supports localization/accessibility

class NotificationService {
  // ...define notification delivery, logging
}

module.exports = NotificationService;

// NotificationService.js
// Delivers/logs all events to users, supports localization/accessibility

const eventBus = require('./EventBus');

class NotificationService {
  constructor() {
    this.notifications = [];
    eventBus.on('petLevelUp', ({ petId, level }) => {
      this.sendNotification(`Pet ${petId} leveled up to ${level}`);
    });
    eventBus.on('itemPurchased', ({ userId, type, itemId, price }) => {
      this.sendNotification(`User ${userId} purchased ${type} (${itemId}) for ${price} Gnee`);
    });
    // ...add more event listeners
  }

  sendNotification(message) {
    this.notifications.push({ message, timestamp: Date.now() });
    // ...deliver to frontend, log, localize
  }
}

module.exports = new NotificationService();
