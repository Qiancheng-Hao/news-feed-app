const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// 注册接口: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. validation: required fields
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 2. validation: check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 3. encryption: hash password (Salt Rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. create user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            avatar: `https://ui-avatars.com/api/?name=${username}&background=random`, // 自动生成一个头像
        });

        // 5. return success
        res.status(201).json({
            message: '注册成功！',
            user: {
                id: newUser.id,
                username: newUser.username,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 登录接口: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: '用户不存在或密码错误' });
        }

        // 2. check password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户不存在或密码错误' });
        }

        // 3. generate Token (valid for 3 hours)
        const token = jwt.sign(
            { userId: user.id, username: user.username }, // Data to include in the Token
            process.env.JWT_SECRET || 'default_secret', // Secret key
            { expiresIn: '3h' }
        );

        // 4. return Token
        res.json({
            message: '登录成功',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 测试接口: GET /api/auth/me (获取当前用户信息)
// 注意：我们在路由中间加了 authenticateToken，这就是“检票”
router.get('/me', authenticateToken, async (req, res) => {
    // 如果能走到这里，说明 Token 验证通过了
    // req.user 就是中间件里解析出来的
    res.json({
        message: '恭喜，你通过了身份验证！',
        yourData: req.user,
    });
});

module.exports = router;
