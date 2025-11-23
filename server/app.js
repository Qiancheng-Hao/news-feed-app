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

// 或者只允许你的 Vercel 域名（更安全）
// app.use(cors({
//    origin: ['http://localhost:5173', 'https://你的-vercel-域名.vercel.app']
// }));

app.use(
    cors({
        origin: [
            'http://localhost:5173', // 本地开发
            'https://news-feed-app-tau-ten.vercel.app', // Vercel 旧域名 (可选)
            'https://newsfeedapp.me', // 根域名
            'https://www.newsfeedapp.me', // 🔥 主域名 (必须加这个！)
        ],
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
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
