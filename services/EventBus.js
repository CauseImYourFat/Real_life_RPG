// Centralized event-driven communication for all modules

class EventBus {
  // ...define event registration, notification, decoupling
}

module.exports = EventBus;

// EventBus.js
// Centralized event-driven communication for all modules

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  emit(event, payload) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(handler => handler(payload));
    }
  }

  off(event, handler) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }
  }
}

module.exports = new EventBus();
