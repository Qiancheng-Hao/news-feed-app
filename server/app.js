const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Allow parsing JSON request bodies

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);

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
