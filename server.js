const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON parsing

// JWT Secret Key (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};


// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'new_database'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});


// Handle login POST
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // First, check if the username exists (case sensitive)
        const userQuery = 'SELECT * FROM users WHERE BINARY username = ?';
        db.query(userQuery, [username], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'USERNAME NOT FOUND' });
            }

            // Username exists, now check password
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Password comparison error:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (isMatch) {
                    // Generate JWT token
                    const token = jwt.sign(
                        {
                            id: user.id,
                            username: user.username
                        },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.json({
                        message: 'Login successful!',
                        token: token,
                        user: { id: user.id, username: user.username },
                        redirect: '/dashboard.html'
                    });
                } else {
                    res.status(401).json({ message: 'PASSWORD IS INCORRECT' });
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle registration POST
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    // First, check if the username already exists (case sensitive)
    const checkQuery = 'SELECT * FROM users WHERE BINARY username = ?';
    db.query(checkQuery, [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            return res.status(409).json({ message: 'USERNAME ALREADY EXISTS' });
        } else {
            // Hash the password
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;
                // Insert new user with hashed password
                const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
                db.query(insertQuery, [username, hash], (err, result) => {
                    if (err) throw err;
                    res.status(201).json({ message: 'Registration successful!' });
                });
            });
        }
    });
});

// Protected dashboard route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({
        message: `Welcome to your dashboard, ${req.user.username}!`,
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// Logout endpoint (client-side token removal)
app.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Serve static files (your index.html)
app.use(express.static(__dirname));

// Start server
app.listen(5500, () => {
    console.log('Server running on http://localhost:5500');
});