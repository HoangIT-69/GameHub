module.exports = function (req, res, next) {
    // Middleware này nên được chạy SAU middleware auth
    // vì nó cần req.user do middleware auth tạo ra
    if (req.user && req.user.role === 'admin') {
        next(); // Nếu là admin, cho đi tiếp
    } else {
        res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
};