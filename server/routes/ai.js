const express = require('express');
const { generateTopics } = require('../utils/ai');
const router = express.Router();

// POST /api/ai/suggest-topics
router.post('/suggest-topics', async (req, res) => {
    try {
        const { content, images } = req.body;
        
        // Basic validation
        if (!content && (!images || images.length === 0)) {
            return res.json({ topics: [] });
        }
        
        const topics = await generateTopics(content, images);
        res.json({ topics });
    } catch (error) {
        console.error('Topic generation failed:', error);
        res.status(500).json({ topics: [] });
    }
});

module.exports = router;
