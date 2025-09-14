const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage (replace with database in production)
let users = [];
let userData = {};

// Helper function to find user by username
const findUser = (username) => users.find(u => u.username === username);

// Helper function to find user by ID
const findUserById = (userId) => users.find(u => u.id === userId);

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

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        if (findUser(username)) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Initialize empty user data
        userData[newUser.id] = {
            skills: {},
            health: {},
            lastSaved: new Date().toISOString()
        };

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username
            }
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

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = findUser(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user data
app.get('/api/user/data', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const data = userData[userId] || {
            skills: {},
            health: {},
            lastSaved: new Date().toISOString()
        };

        res.json(data);
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save user data
app.post('/api/user/data', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { skills, health } = req.body;

        userData[userId] = {
            skills: skills || {},
            health: health || {},
            lastSaved: new Date().toISOString()
        };

        res.json({ 
            message: 'Data saved successfully',
            lastSaved: userData[userId].lastSaved
        });
    } catch (error) {
        console.error('Save user data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update specific skill
app.post('/api/user/skills/:skillId', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { skillId } = req.params;
        const { level, experience } = req.body;

        if (!userData[userId]) {
            userData[userId] = { skills: {}, health: {} };
        }

        userData[userId].skills[skillId] = { level, experience };
        userData[userId].lastSaved = new Date().toISOString();

        res.json({ 
            message: 'Skill updated successfully',
            skill: userData[userId].skills[skillId]
        });
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update health data
app.post('/api/user/health', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const healthData = req.body;

        if (!userData[userId]) {
            userData[userId] = { skills: {}, health: {} };
        }

        userData[userId].health = healthData;
        userData[userId].lastSaved = new Date().toISOString();

        res.json({ 
            message: 'Health data updated successfully',
            health: userData[userId].health
        });
    } catch (error) {
        console.error('Update health error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        users: users.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Real-Life RPG Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;