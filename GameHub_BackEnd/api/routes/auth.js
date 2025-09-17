const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        // Validation rules (giữ nguyên)
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Thêm 'role' vào destructuring
        const { name, email, password, role } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            // Xây dựng đối tượng user mới
            const newUserFields = {
                name,
                email,
                password
            };

            // Kiểm tra và gán vai trò
            if (role && role === 'admin') {
                newUserFields.role = 'admin';
                // Gán ví "vô hạn" cho admin
                newUserFields.walletBalance = Number.MAX_SAFE_INTEGER;
            } else {
                // Nếu không phải admin, thì là customer với ví tiền mặc định là 0
                // Model đã có default: 0 nên chúng ta không cần gán ở đây nữa
                newUserFields.role = 'customer';
            }

            user = new User(newUserFields);

            // Encrypt password (giữ nguyên)
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Save user to database (giữ nguyên)
            await user.save();

            // Return jsonwebtoken (giữ nguyên)
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// Bạn có thể thêm route Đăng nhập (login) ở đây
// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post(
    '/login',
    [
        // Validation rules
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // 1. Check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // 2. Compare password
            // So sánh password người dùng gửi lên với password đã hash trong DB
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // 3. If credentials are correct, return jsonwebtoken
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);



// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        // req.user.id được lấy từ middleware
        const user = await User.findById(req.user.id).select('-password'); // .select('-password') để không trả về password
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
module.exports = router;