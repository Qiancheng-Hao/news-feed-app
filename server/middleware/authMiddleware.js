const jwt = require('jsonwebtoken');
const { User } = require('../db');

const authenticateToken = async (req, res, next) => {
    // 1. get Token from request header
    // format: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // extract the part after Bearer

    if (!token) {
        return res.status(401).json({ message: '未提供 Token, 访问拒绝' }); // no token
    }

    // 2. verify Token
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token 无效或已过期' }); // invalid token
        }
        // additionally check if user still exists in DB
        try {
            const userexist = await User.findByPk(user.userId);
            if (!userexist) {
                return res.status(401).json({ message: '用户不存在' });
            }
        } catch (e) {
            return res.status(500).json({ message: '服务器繁忙, 请稍后再试: '});
        }

        // 3. verification passed, store user info in req for later use
        req.user = user;
        next(); // Pass control to the next
    });
};

module.exports = authenticateToken;
