const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

// Database connection
const db = mysql.createConnection({
    host: '127.0.0.1', // Use IPv4 to avoid "::1" issues
    user: 'root',
    password: 'your_password', // Replace with your MySQL root password
    database: 'instagram_clone',
    port: 3306
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

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Server error', error: err });
            }

            if (results.length > 0) {
                // Compare password using bcrypt
                const validPassword = await bcrypt.compare(password, results[0].password);
                if (validPassword) {
                    res.json({ message: 'Login successful!' });
                } else {
                    res.status(401).json({ message: 'Invalid username or password.' });
                }
            } else {
                res.status(401).json({ message: 'Invalid username or password.' });
            }
        }
    );
});

// Handle Register Request
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err, results) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: 'Username already exists.' });
                    }
                    return res.status(500).json({ message: 'Server error', error: err });
                }
                res.json({ message: 'User registered successfully!' });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to Instagram Clone API!');
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
