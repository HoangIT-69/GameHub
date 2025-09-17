const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin user đã giải mã vào object request
        req.user = decoded.user;
        next(); // Chuyển sang middleware/route tiếp theo
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};