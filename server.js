// API: List all pet folders in dist/assets/pets/shop (excluding 'food')
app.get('/api/shop/pets', async (req, res) => {
    try {
        const petsDir = path.join(__dirname, 'dist/assets/pets/shop');
        const folders = fs.readdirSync(petsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name !== 'food')
            .map(dirent => dirent.name);
        res.json(folders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to list pets', details: err.message });
    }
});
// ...existing code...
// ...existing code...
// ...existing code...
// Move this endpoint below app initialization
// ...existing code...
// ...existing code...
// ...existing code...
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Only require fs once at the top of the file
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const path = require('path');
// MongoDB setup
const mongoose = require('mongoose');
// Removed duplicate fs require
// Always load .env.local first for local dev, fallback to .env
require('dotenv').config({ path: '.env.local' });
// Load Google OAuth credentials
let googleOAuthConfig = {};
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    googleOAuthConfig.web = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_CALLBACK_URL]
    };
} else {
    try {
        googleOAuthConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'google-oauth.json')));
    } catch (err) {
        console.warn('Google OAuth config not found or invalid:', err.message);
    }
}
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
// Security middleware
app.use(helmet());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    });
}
// Express session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport user serialization
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google OAuth strategy
if (googleOAuthConfig.web) {
    passport.use(new GoogleStrategy({
        clientID: googleOAuthConfig.web.client_id,
        clientSecret: googleOAuthConfig.web.client_secret,
        callbackURL: googleOAuthConfig.web.redirect_uris[0]
    },
    async (accessToken, refreshToken, profile, done) => {
        // Find or create user in MongoDB
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                username: profile.displayName,
                googleId: profile.id,
                createdAt: new Date().toISOString()
            });
            await user.save();
        }
        return done(null, { id: user._id, username: user.username });
    }
    ));
}
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from 'public' if present, otherwise from root
// API to list all frog GIFs in Frog folder
app.get('/api/frog-gifs', (req, res) => {
        const frogDir = path.join(__dirname, 'dist/assets/pets/shop/Frog');
        fs.readdir(frogDir, (err, files) => {
            if (err) {
                console.error('Error reading frog GIFs folder:', frogDir, err);
                return res.status(500).json({ error: 'Cannot read frog GIFs folder', details: err.message, path: frogDir });
            }
            const gifs = files.filter(f => f.endsWith('.gif'));
            res.json(gifs);
        });
});
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');
app.use('/assets', express.static(assetsDir));
app.use(express.static(distDir));

// Fallback: serve index.html for all non-API, non-asset requests (SPA routing)
app.get(/^\/(?!api|assets).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

// Remove in-memory storage. Use MongoDB only.

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
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
    if (profile) mongoUserData.profile = { ...mongoUserData.profile, ...profile };
        mongoUserData.lastSaved = new Date().toISOString();
        await mongoUserData.save();

        res.json({ message: 'User data saved successfully', lastSaved: mongoUserData.lastSaved });
    } catch (error) {
        console.error('Save user data error:', error);
        res.status(500).json({ error: 'Failed to save user data' });
    }
});

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
// Tamagotchi API: Get user tamagotchi data
app.get('/api/user/tamagotchi', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        let mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            // Default shop pets from assets/pets/shop
            const shopPets = ['white dog', 'Frog', 'Bird', 'plant'];
            mongoUserData = new UserData({
                userId,
                tamagotchi: {
                    purchased: {},
                    shop: shopPets,
                    hive: [],
                    currentMascot: '',
                    editHistory: []
                },
                lastSaved: new Date().toISOString()
            });
            await mongoUserData.save();
        }
        // Return only tamagotchi data
        res.json(mongoUserData.tamagotchi);
    } catch (error) {
        console.error('Get tamagotchi error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Tamagotchi API: Save user tamagotchi data (XP, purchased, mascot)
app.post('/api/user/tamagotchi', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { mascotXP, purchased, currentMascot } = req.body;
        let mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            return res.status(404).json({ error: 'User data not found' });
        }
        // Merge new data
        mongoUserData.tamagotchi = {
            ...mongoUserData.tamagotchi,
            mascotXP: mascotXP || mongoUserData.tamagotchi.mascotXP,
            purchased: purchased || mongoUserData.tamagotchi.purchased,
            currentMascot: currentMascot || mongoUserData.tamagotchi.currentMascot
        };
        await mongoUserData.save();
        res.json({ message: 'Tamagotchi data saved' });
    } catch (error) {
        console.error('Save tamagotchi error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Tamagotchi API: Update user tamagotchi data (buy, edit, delete, transfer, XP, setCurrent)
app.put('/api/user/tamagotchi', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { action, mascotType, changes, toUser, amount, foodName } = req.body;
        let mongoUserData = await UserData.findOne({ userId });
        if (!mongoUserData) {
            return res.status(404).json({ error: 'User data not found' });
        }
        // Deep merge to retain all existing pet data and support Gnee! points
        let tamagotchi = mongoUserData.tamagotchi || {};
        tamagotchi.purchased = tamagotchi.purchased || {};
        tamagotchi.hive = tamagotchi.hive || [];
        tamagotchi.shop = tamagotchi.shop || ['white dog', 'Frog', 'Bird', 'plant'];
        tamagotchi.gneePoints = typeof tamagotchi.gneePoints === 'number' ? tamagotchi.gneePoints : 0;
        tamagotchi.foodInventory = tamagotchi.foodInventory || [];

        if (action === 'buy' && mascotType) {
            if (!tamagotchi.purchased[mascotType]) {
                tamagotchi.purchased[mascotType] = { name: mascotType, assetFolder: mascotType, actions: ['wake', 'run', 'sleep'], createdAt: new Date().toISOString(), editHistory: [] };
                tamagotchi.hive.push(mascotType);
                tamagotchi.currentMascot = mascotType;
            }
            // If Gnee! points are sent, update them
            if (typeof req.body.gneePoints === 'number') {
                tamagotchi.gneePoints = req.body.gneePoints;
            }
        } else if (action === 'edit' && mascotType && changes) {
            if (tamagotchi.purchased[mascotType]) {
                Object.assign(tamagotchi.purchased[mascotType], changes);
                tamagotchi.purchased[mascotType].editHistory = tamagotchi.purchased[mascotType].editHistory || [];
                tamagotchi.purchased[mascotType].editHistory.push({ changes, timestamp: new Date().toISOString() });
            }
        } else if (action === 'delete' && mascotType) {
            delete tamagotchi.purchased[mascotType];
            tamagotchi.hive = tamagotchi.hive.filter(x => x !== mascotType);
            if (tamagotchi.currentMascot === mascotType) tamagotchi.currentMascot = tamagotchi.hive[0] || '';
        } else if (action === 'transfer' && mascotType && toUser) {
            // For demo: just delete from hive
            delete tamagotchi.purchased[mascotType];
            tamagotchi.hive = tamagotchi.hive.filter(x => x !== mascotType);
            if (tamagotchi.currentMascot === mascotType) tamagotchi.currentMascot = tamagotchi.hive[0] || '';
        } else if (action === 'setCurrent' && mascotType) {
            tamagotchi.currentMascot = mascotType;
        } else if (action === 'claimGnee') {
            // Daily claim: add Gnee point and set last claim date
            tamagotchi.gneePoints = (tamagotchi.gneePoints || 0) + (amount || 1);
            tamagotchi.lastGneeClaim = new Date().toISOString();
        } else if (action === 'buyFood' && foodName) {
            // Add food to inventory and deduct 1 Gnee point
            if ((tamagotchi.gneePoints || 0) >= 1) {
                tamagotchi.gneePoints -= 1;
                tamagotchi.foodInventory.push(foodName);
            }
        } else if (action === 'useFood' && foodName) {
            // Remove food from inventory and apply permanent effect
            tamagotchi.foodInventory = tamagotchi.foodInventory.filter(f => f !== foodName);
            tamagotchi[`buff_${foodName}`] = true; // Mark buff as permanent
        }
        // Always merge and retain all fields
        // Only update mascotXP if it was changed in this request
        const dbTama = mongoUserData.tamagotchi || {};
        dbTama.purchased = tamagotchi.purchased;
        dbTama.hive = tamagotchi.hive;
        dbTama.shop = tamagotchi.shop;
        dbTama.gneePoints = tamagotchi.gneePoints;
        dbTama.currentMascot = tamagotchi.currentMascot;
        dbTama.foodInventory = tamagotchi.foodInventory;
        dbTama.lastGneeClaim = tamagotchi.lastGneeClaim;
        // Persist permanent buffs
        Object.keys(tamagotchi).forEach(k => {
          if (k.startsWith('buff_')) dbTama[k] = tamagotchi[k];
        });
        mongoUserData.tamagotchi = dbTama;
        mongoUserData.lastSaved = new Date().toISOString();
        await mongoUserData.save();
        res.json(dbTama);
    } catch (error) {
        console.error('Update tamagotchi error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Google OAuth routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to app or send token
        // You can generate a JWT here if you want to use your existing auth flow
        res.redirect('/');
    }
);

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Basic input validation
        if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        if (!/^[a-zA-Z0-9_]{3,}$/.test(username)) {
            return res.status(400).json({ error: 'Username must be at least 3 characters and contain only letters, numbers, and underscores.' });
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
            console.log('[DEBUG] Loaded user data from MongoDB:', mongoUserData);
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

// Serve index.html for all unknown routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
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