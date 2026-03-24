const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ SERVE FRONTEND (VERY IMPORTANT POSITION)
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== JWT Secret =====
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// ===== Auth Middleware =====
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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

// ===== MySQL =====
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'new_database'
});

db.connect((err) => {
    if (err) {
        console.error('DB error:', err);
        return;
    }
    console.log('Connected to database.');
});

// ===== ROUTES =====

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE BINARY username = ?';

    db.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'USERNAME NOT FOUND' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.status(401).json({ message: 'PASSWORD IS INCORRECT' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful!',
                token,
                redirect: 'dashboard.html'
            });
        });
    });
});

// REGISTER
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const checkQuery = 'SELECT * FROM users WHERE BINARY username = ?';

    db.query(checkQuery, [username], (err, results) => {
        if (results.length > 0) {
            return res.status(409).json({
                message: 'Username already exists, try another username'
            });
        }

        bcrypt.hash(password, 10, (err, hash) => {
            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';

            db.query(insertQuery, [username, hash], (err) => {
                if (err) return res.status(500).json({ message: 'DB error' });

                res.status(201).json({ message: 'Registration successful!' });
            });
        });
    });
});

// DASHBOARD API
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({
        message: `Welcome ${req.user.username}!`,
        user: req.user
    });
});

// LOGOUT
app.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// ===== START SERVER =====
app.listen(5500, () => {
    console.log('Server running at http://localhost:5500');
});