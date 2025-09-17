const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Cần xác thực người dùng

const User = require('../models/User');
const Game = require('../models/Game');
const admin = require('../middleware/admin'); 

// @route   POST api/users/purchase
// @desc    Purchase all games in the cart
// @access  Private
router.post('/purchase', auth, async (req, res) => {
    const { gameIds, totalPrice } = req.body; // Lấy dữ liệu từ front-end

    try {
        const user = await User.findById(req.user.id);
        
        // 1. Kiểm tra tổng tiền có khớp không (để bảo mật)
        const games = await Game.find({ '_id': { $in: gameIds } });
        const actualPrice = games.reduce((total, game) => total + game.price, 0);

        if (totalPrice !== actualPrice) {
            return res.status(400).json({ msg: 'Price mismatch. Please try again.' });
        }

        // 2. Kiểm tra xem người dùng có đủ tiền không
        if (user.walletBalance < actualPrice) {
            return res.status(400).json({ msg: 'Insufficient funds' });
        }

        // 3. Kiểm tra xem có game nào đã sở hữu chưa
        const isAlreadyOwned = games.some(game => 
            user.library.some(item => item.game.toString() === game.id)
        );
        if (isAlreadyOwned) {
            return res.status(400).json({ msg: 'One or more games are already in your library.' });
        }
        
        // 4. Nếu mọi thứ OK, thực hiện giao dịch
        user.walletBalance -= actualPrice;
        const newLibraryItems = games.map(game => ({ game: game.id }));
        user.library.unshift(...newLibraryItems); // Thêm tất cả game mới vào thư viện

        await user.save();

        // 5. Trả về toàn bộ thông tin user đã cập nhật
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/library', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('library.game'); 

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.library);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users
// @desc    Get all users
// @access  Admin Only
router.get('/', [auth, admin], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;