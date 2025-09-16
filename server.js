// Save all user data (skills, health, preferences, profile)
app.post('/api/user/data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { skills, health, preferences, profile } = req.body;

        let mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            mongoUserData = new UserData({ userId, skills: {}, health: {}, preferences: {}, profile: { description: '', profileImage: '' }, lastSaved: new Date().toISOString() });
        }

        if (skills) mongoUserData.skills = skills;
        if (health) mongoUserData.health = health;
        if (preferences) mongoUserData.preferences = preferences;
        if (profile) mongoUserData.profile = profile;
        mongoUserData.lastSaved = new Date().toISOString();
        await mongoUserData.save();

        res.json({ message: 'User data saved successfully', lastSaved: mongoUserData.lastSaved });
    } catch (error) {
        console.error('Save user data error:', error);
        res.status(500).json({ error: 'Failed to save user data' });
    }
});
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path');
// MongoDB setup
const mongoose = require('mongoose');
require('dotenv').config();
const { User, UserData } = require('./src/models/mongoModels');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Remove in-memory storage. Use MongoDB only.

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// API Routes

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user in MongoDB
        const mongoUser = new User({ username, password: hashedPassword, createdAt: new Date().toISOString() });
        await mongoUser.save();
        // Create empty user data in MongoDB
        const mongoUserData = new UserData({ userId: mongoUser._id, skills: {}, health: {}, preferences: {}, profile: { description: '', profileImage: '' }, lastSaved: new Date().toISOString() });
        await mongoUserData.save();
        // Generate JWT token
        const token = jwt.sign({ userId: mongoUser._id, username: mongoUser.username }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: mongoUser._id, username: mongoUser.username }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        // Find user in MongoDB
        const mongoUser = await User.findOne({ username });
        if (!mongoUser) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Check password
        const isValidPassword = await bcrypt.compare(password, mongoUser.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: mongoUser._id, username: mongoUser.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: mongoUser._id, username: mongoUser.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user data
app.get('/api/user/data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            return res.json({ skills: {}, health: {}, preferences: {}, profile: { description: '', profileImage: '' }, lastSaved: new Date().toISOString() });
        }
        res.json(mongoUserData);
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save user data
app.delete('/api/user/delete', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { confirmText } = req.body;

        if (confirmText !== 'delete') {
            return res.status(400).json({ error: 'Must type "delete" to confirm account deletion' });
        }

        // Remove user and user data from MongoDB
        await User.deleteOne({ _id: userId });
        await UserData.deleteOne({ userId });

        console.log(`User account deleted: ${userId}`);
        res.json({ 
            message: 'Account deleted successfully',
            deleted: true
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// ...existing code...

// Update health data
app.post('/api/user/health', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const healthData = req.body;

        let mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            mongoUserData = new UserData({ userId, skills: {}, health: {}, preferences: {}, profile: { description: '', profileImage: '' }, lastSaved: new Date().toISOString() });
        }

        mongoUserData.health = healthData;
        mongoUserData.lastSaved = new Date().toISOString();
        await mongoUserData.save();

        res.json({ 
            message: 'Health data updated successfully',
            health: mongoUserData.health
        });
    } catch (error) {
        console.error('Update health error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change username
app.put('/api/user/username', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { newUsername } = req.body;

        // Validation
        if (!newUsername || newUsername.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }

        // Check if new username already exists in MongoDB
        const existingUser = await User.findOne({ username: newUsername.trim() });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Find and update user in MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.username = newUsername.trim();
        await user.save();

        res.json({ 
            message: 'Username changed successfully',
            username: user.username
        });

    } catch (error) {
        console.error('Change username error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
app.put('/api/user/password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Find user in MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ 
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { description, profileImage } = req.body;

        let mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            mongoUserData = new UserData({ userId, skills: {}, health: {}, preferences: {}, profile: { description: '', profileImage: '' }, lastSaved: new Date().toISOString() });
        }

        mongoUserData.profile = {
            description: description || '',
            profileImage: profileImage || ''
        };
        mongoUserData.lastSaved = new Date().toISOString();
        await mongoUserData.save();

        res.json({ 
            message: 'Profile updated successfully',
            profile: mongoUserData.profile
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user account
// ...existing code...

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const userCount = await User.countDocuments({});
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            users: userCount
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Real-Life RPG Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;