const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// app.use(cors()); // Enable CORS


app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'https://news-feed-app-tau-ten.vercel.app',
            'https://newsfeedapp.me',
            'https://www.newsfeedapp.me',
        ],
        exposedHeaders: ['x-new-token'], // Allow frontend to access this header
        // credentials: true, // Cookie
    })
);

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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
