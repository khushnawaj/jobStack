require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/system-status', (req, res) => {
    const mask = (s) => (s && typeof s === 'string') ? `${s.substring(0, 4)}...${s.slice(-4)}` : 'MISSING';
    res.json({
        database: 'Connected',
        rapid_key: mask(process.env.RAPID_API_KEY),
        gemini_key: mask(process.env.GEMINI_API_KEY),
        port: process.env.PORT || 5000,
        env: process.env.NODE_ENV
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('JobKit Pro API Running');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the process using it or change the port in .env`);
    } else {
        console.error('Server error:', err);
    }
});
