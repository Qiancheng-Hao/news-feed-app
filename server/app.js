const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Allow parsing JSON request bodies

// Mount routes
app.use('/api/auth', authRoutes); // All requests starting with /api/auth are handled by authRoutes

// Test root route
app.get('/', (req, res) => {
    res.send('News Feed Backend is Running!');
});

// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 服务运行在 http://localhost:${PORT}`);
    });
});
