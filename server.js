const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' folder

// Database connection
const db = mysql.createConnection({
    host: 'mysql.railway.internal',  // Use Railway's MySQL host
    user: 'root',                    // Your MySQL username
    password: 'GBMVwKKzWYHVsJzFpqVkrjpVIeMHLjEk',  // Your MySQL password
    database: 'railway'              // Your MySQL database name
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Handle Login Request
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Server error', error: err });
            }
            if (results.length > 0) {
                res.json({ message: 'Login successful!' });
            } else {
                res.status(401).json({ message: 'Invalid username or password.' });
            }
        }
    );
});

// Handle Register Request
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Server error', error: err });
            }
            res.json({ message: 'User registered successfully!' });
        }
    );
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
