// Exposes REST/GraphQL endpoints for frontend/backend communication

class APIGateway {
  // ...define authentication, validation, error logging, permission roles
}

module.exports = APIGateway;

// APIGateway.js
// Exposes REST/GraphQL endpoints for frontend/backend communication

const express = require('express');
const userService = require('./UserService');
const petService = require('./PetService');
const shopService = require('./ShopService');
const healthSkillsService = require('./HealthSkillsService');
const assetRegistry = require('./AssetRegistry');

class APIGateway {
  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    // User endpoints
    this.app.post('/user', (req, res) => {
      const userId = userService.createUser(req.body);
      res.json({ userId });
    });
    this.app.get('/user/:id', (req, res) => {
      res.json(userService.getUser(req.params.id));
    });

    // User data sync endpoints for frontend
    this.app.get('/api/user/data', (req, res) => {
      // For demo: use a fixed userId or get from session/auth
      const userId = req.query.userId || Object.keys(userService.users)[0];
      const user = userService.getUser(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({
        skills: user.skills || {},
        health: user.health || {},
        preferences: user.preferences || {},
        profile: user.profile || {}
      });
    });
    this.app.post('/api/user/data', (req, res) => {
      // For demo: use a fixed userId or get from session/auth
      const userId = req.body.userId || Object.keys(userService.users)[0];
      const user = userService.getUser(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.skills = req.body.skills || user.skills;
      user.health = req.body.health || user.health;
      user.preferences = req.body.preferences || user.preferences;
      user.profile = req.body.profile || user.profile;
      res.json({ message: 'User data updated successfully' });
    });

    // Pet endpoints
    this.app.post('/pet', (req, res) => {
      const { userId, petData } = req.body;
      const petId = petService.createPet(userId, petData);
      res.json({ petId });
    });
    this.app.get('/pet/:id', (req, res) => {
      res.json(petService.getPet(req.params.id));
    });

    // Shop endpoints
    this.app.post('/shop/buy', (req, res) => {
      const { userId, type, itemData } = req.body;
      const success = shopService.buyItem(userId, type, itemData);
      res.json({ success });
    });
    this.app.post('/shop/sell', (req, res) => {
      const { userId, type, itemId } = req.body;
      shopService.sellItem(userId, type, itemId);
      res.json({ success: true });
    });

    // Health endpoints
    this.app.post('/user/:id/health', (req, res) => {
      userService.updateHealth(req.params.id, req.body.health);
      res.json({ success: true });
    });

    // Asset endpoints
    this.app.get('/assets', (req, res) => {
      res.json(assetRegistry.assets);
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`API Gateway running on port ${port}`);
    });
  }
}

module.exports = new APIGateway();
