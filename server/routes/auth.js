const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// 验证码存储
const codeStore = new Map();

// 配置 Gmail 邮件发送器
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // configured in .env
        pass: process.env.EMAIL_PASS, // configured in .env
    },
});

// 接口：发送验证码 (POST /api/auth/send-code) ===
router.post('/send-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: '请输入邮箱地址' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            // if user found, 409 Conflict
            return res.status(409).json({ message: '该邮箱已注册，请直接登录' });
        }
    } catch (dbError) {
        console.error('数据库查询失败:', dbError);
        return res.status(500).json({ message: '服务器繁忙，请稍后再试' });
    }

    // generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // store in memory, expire in 5 minutes
    codeStore.set(email, { code, expire: Date.now() + 5 * 60 * 1000 });

    console.log(`🔍 验证码发送至 ${email}`);

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '【News Feed App】注册验证码',
            text: `您的验证码是：${code}, 有效期5分钟。如非本人操作请忽略。`,
        });

        res.json({ message: '验证码已发送，请查收邮箱' });
    } catch (error) {
        console.error('❌ 邮件发送失败:', error);
        res.status(500).json({ message: '发送失败，请检查邮箱地址或稍后重试' });
    }
});

// 注册接口: POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, code, password, username } = req.body;

    try {
        // 1. valideate code
        const record = codeStore.get(email);
        if (!record || record.code !== code) {
            return res.status(400).json({ message: '验证码错误或已过期' });
        }

        // 2. check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }

        // 3. handle username
        let finalUsername = username;

        // if username provided, check if exists
        if (username) {
            const existingName = await User.findOne({ where: { username } });
            if (existingName) {
                return res.status(400).json({ message: '用户名已存在，请换一个' });
            }
        } else {
            // if username not provided, auto-generate one: User_emailPrefix_randomNumber
            const emailPrefix = email.split('@')[0];
            const randomSuffix = Math.floor(Math.random() * 1000);
            finalUsername = `User_${emailPrefix}_${randomSuffix}`;
        }

        // 4. create user
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username: finalUsername,
            password: hashedPassword,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${finalUsername}`,
        });

        codeStore.delete(email);
        res.status(201).json({ message: '注册成功' });
        console.log(`✅ 新用户注册: ${finalUsername} (${email})`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '注册失败' });
        console.log('❌ 注册失败');
    }
});

// 登录接口: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. find user by email or username
        const { Op } = require('sequelize');
        const user = await User.findOne({
            where: {
                [Op.or]: [{ username: username }, { email: username }],
            },
        });
        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }

        // 2. check password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 3. generate Token (valid for 3 hours)
        const token = jwt.sign(
            { userId: user.id, username: user.username, avatar: user.avatar }, // Data to include in the Token
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

// clear expired codes every minute
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of codeStore.entries()) {
        if (now > data.expire) {
            codeStore.delete(email);
            console.log(`🧹 [批量清理] 删除过期邮箱验证码: ${email}`);
        }
    }
}, 60 * 1000);

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
