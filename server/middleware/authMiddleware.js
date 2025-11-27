const jwt = require('jsonwebtoken');
const { User } = require('../db');

const authenticateToken = async (req, res, next) => {
    // get Token from request header
    // format: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // extract the part after Bearer

    if (!token) {
        return res.status(401).json({ message: '未提供 Token, 访问拒绝' }); // no token
    }

    // verify Token
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token 无效或已过期' }); // invalid token
        }

        // Check if token needs refresh (If remaining time is less than 1 hour)
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - now;
        if (timeLeft < 3600) {
            const newToken = jwt.sign(
                { id: decoded.id, username: decoded.username, avatar: decoded.avatar },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '3h' }
            );
            res.setHeader('x-new-token', newToken);
        }

        // additionally check if user still exists in DB
        try {
            const userexist = await User.findByPk(decoded.id);
            if (!userexist) {
                return res.status(401).json({ message: '用户不存在' });
            }
        } catch (e) {
            return res.status(500).json({ message: '服务器繁忙, 请稍后再试' });
        }

        // verification passed, store user info in req for later use
        req.user = decoded;
        next(); // Pass control to the next
    });
};

module.exports = authenticateToken;
