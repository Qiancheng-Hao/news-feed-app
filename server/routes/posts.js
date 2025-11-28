const express = require('express');
const { Post, User, sequelize } = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { generateTags } = require('../utils/ai');
const { Op } = require('sequelize');

const router = express.Router();

async function processPostTagsInBackground(postId, content, images, postStatus) {
    // Only process if published and has content/images
    if (postStatus === 'published' && (content || (images && images.length > 0))) {
        try {
            const generatedTags = await generateTags(content, images);
            if (generatedTags && generatedTags.length > 0) {
                const currentPost = await Post.findByPk(postId);
                if (currentPost) {
                    const existingTags = currentPost.tags || [];
                    const mergedTags = Array.from(
                        new Set([...existingTags, ...generatedTags])
                    ).slice(0, 5);
                    currentPost.tags = mergedTags;
                    await currentPost.save();
                    console.log(`🏷️ Tags processed for post ${postId}:`, mergedTags);
                }
            }
        } catch (err) {
            console.error(`❌ Background tag processing failed for post ${postId}:`, err);
        }
    }
}

// Create a new post (published or draft) (POST /api/posts)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { content, images, tags, status = 'published' } = req.body;
        const userId = req.user.id;

        // Content or images required validation
        if (!content && (!images || images.length === 0)) {
            return res.status(400).json({ message: '内容不能为空' });
        }

        // Create new post
        const newPost = await Post.create({
            user_id: userId,
            content: content || '',
            images: images || [],
            tags: tags || [],
            status: status,
        });

        console.log(
            '✅',
            req.user.username,
            `${status === 'published' ? '发布了帖子' : '保存了草稿'}`
        );

        // Return the post object before tag generation
        res.status(201).json(newPost);

        // Trigger background tag processing
        processPostTagsInBackground(newPost.id, content, images, status);
    } catch (error) {
        console.error('创建失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// get the posts (GET /api/posts)
router.get('/', async (req, res) => {
    try {
        // page & pageSize
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const offset = (page - 1) * pageSize;

        const posts = await Post.findAll({
            where: { status: 'published' },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'avatar'],
                },
            ],
            order: [['created_at', 'DESC']], // descending order by created_at
            limit: pageSize,
            offset: offset,
        });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取列表失败' });
    }
});

// Get the latest draft for the current user (GET /api/posts/draft)
router.get('/draft', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const draft = await Post.findOne({
            where: {
                user_id: userId,
                status: 'draft',
            },
            order: [['updated_at', 'DESC']],
        });

        if (!draft) {
            // It's not an error if no draft is found, so return 200 with null
            return res.status(200).json(null);
        }

        res.json(draft);
    } catch (error) {
        console.error('Failed to fetch latest draft:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// Get a single post by ID (GET /api/posts/:id)
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'avatar'],
                },
            ],
        });

        if (!post) {
            return res.status(404).json({ message: '帖子不存在' });
        }

        res.json(post);
    } catch (error) {
        console.error('获取详情失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// Update a post (PUT /api/posts/:id)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const { content, images, tags, status } = req.body;

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: '帖子不存在' });
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: '无权编辑此帖子' });
        }

        // Update fields
        if (content !== undefined) post.content = content;
        if (images !== undefined) post.images = images;
        if (tags !== undefined) post.tags = tags;
        if (status !== undefined) post.status = status;

        await post.save();

        res.status(200).json(post);

        // Trigger background tag processing
        processPostTagsInBackground(postId, post.content, post.images, post.status);
    } catch (error) {
        console.error('更新失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// Delete a post (DELETE /api/posts/:id)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: '帖子不存在' });
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: '无权删除此帖子' });
        }

        await post.destroy();

        console.log('✅', req.user.username, '删除了帖子');

        res.status(200).json({ message: '删除成功' });
    } catch (error) {
        console.error('删除失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;
