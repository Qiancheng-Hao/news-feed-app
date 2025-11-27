const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { Resend } = require('resend');
require('dotenv').config();

const router = express.Router();

// 验证码存储
const codeStore = new Map();

const resend = new Resend(process.env.RESEND_API_KEY);

// 接口：发送验证码 (POST /api/auth/send-code) ===
router.post('/send-code', async (req, res) => {
    const { email, type } = req.body;

    if (!email) {
        return res.status(400).json({ message: '请输入邮箱地址' });
    }

    // generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // store in memory, expire in 5 minutes
    codeStore.set(email, { code, expire: Date.now() + 5 * 60 * 1000 });

    try {
        const data = await resend.emails.send({
            from: 'noreply@newsfeedapp.me',
            to: email,
            subject: `【News App】${type === 'register' ? '注册' : '登录'}验证码`,
            html: `<p>您的验证码是：<strong>${code}</strong></p><p>有效期5分钟。如非本人操作请忽略。</p>`,
        });
        if (data.error) {
            console.error('Resend 报错:', data.error);
            return res.status(500).json({ message: '发送失败' });
        }

        console.log(`✅ 邮件发送成功至 ${email}`);

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
            return res.status(409).json({ message: '该邮箱已被注册' });
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
        console.log(`✅ 新用户注册: ${finalUsername} (${email})`);
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '注册失败' });
        console.log('❌ 注册失败');
    }
});

// 登录接口: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { type, username, password, email, code } = req.body;

        let user = null;

        if (type === 'email_code') {
            const record = codeStore.get(email);
            if (!record || record.code !== code) {
                return res.status(400).json({ message: '验证码错误' });
            }
            if (Date.now() > record.expire) {
                codeStore.delete(email);
                return res.status(400).json({ message: '验证码已过期' });
            }

            user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: '用户不存在' });
            }
            codeStore.delete(email);
        } else if (type === 'password') {
            // find user by email or username
            const { Op } = require('sequelize');
            user = await User.findOne({
                where: {
                    [Op.or]: [{ username: username }, { email: username }],
                },
            });
            if (!user) {
                return res.status(401).json({ message: '用户不存在' });
            }
            // check password match
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: '密码错误' });
            }
        }

        // generate Token (valid for 3 hours)
        const token = jwt.sign(
            { id: user.id, username: user.username, avatar: user.avatar }, // Data to include in the Token
            process.env.JWT_SECRET || 'default_secret', // Secret key
            { expiresIn: '3h' }
        );

        // return Token
        res.json({
            message: '登录成功',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
            },
        });
        console.log(`✅ 用户登录: ${user.username} (${user.email})`);
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

// 获取当前用户信息: GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    res.json({
        message: '恭喜，你通过了身份验证！',
        yourData: req.user,
    });
});

// 检查邮箱是否已注册: POST /api/auth/check-email
router.post('/check-email', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // return { exists: true/false }
    res.json({ exists: !!user });
});

module.exports = router;
