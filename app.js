const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const config = require('./config');
const PORT = process.env.PORT || 3000;
const secretKey = config.JWT_SECRET;
// Dummy data
const dummyData = [
    { id: 1, title: 'Post 1', content: 'This is the content of Post 1' },
    { id: 2, title: 'Post 2', content: 'This is the content of Post 2' },
    // Add more dummy data as needed
];

// In-memory users (for demonstration, replace this with a proper database in production)
const users = [];

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// User registration endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    // For simplicity, storing plain password (in production, hash passwords before storing)
    users.push({ username, password });

    return res.status(201).json({ message: 'User registered successfully' });
});

// User authentication endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token upon successful authentication
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    return res.status(200).json({ token });
});

// Data endpoint
app.get('/data', authenticateToken, (req, res) => {
    // Return dummy data
    return res.status(200).json(dummyData);
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
