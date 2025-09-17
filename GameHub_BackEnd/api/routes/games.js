const express = require('express');
const router = express.Router();

const Game = require('../models/Game');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST api/games
// @desc    Create a new game
// @access  Admin Only
router.post('/', [auth, admin], async (req, res) => {
    try {
        // Lấy các trường từ body, bao gồm cả mảng 'images' mới
        const {
            title,
            description,
            price,
            developer,
            publisher,
            genres,
            images // Sửa ở đây
        } = req.body;

        // Kiểm tra xem mảng images có được gửi lên không
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ msg: 'Please provide at least one image URL.' });
        }

        const newGame = new Game({
            title,
            description,
            price,
            developer,
            publisher,
            genres,
            images // Sửa ở đây
        });

        const game = await newGame.save();
        res.status(201).json(game);
    } catch (err) {
        console.error(err.message);
        // Bắt lỗi validation từ Mongoose
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/games
// @desc    Get all games
// @access  Public
router.get('/', async (req, res) => {
    try {
        const games = await Game.find().sort({ releaseDate: -1 });
        res.json(games);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/games/:id
// @desc    Get a single game by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }
        res.json(game);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Game not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/games/:id
// @desc    Update a game
// @access  Admin Only
router.put('/:id', [auth, admin], async (req, res) => {
    // Chỉ lấy các trường có thể được cập nhật từ body
    const {
        title,
        description,
        price,
        developer,
        publisher,
        genres,
        images // Sửa ở đây
    } = req.body;

    // Xây dựng object chứa các trường cần update
    const gameFields = {};
    if (title) gameFields.title = title;
    if (description) gameFields.description = description;
    if (price) gameFields.price = price;
    if (developer) gameFields.developer = developer;
    if (publisher) gameFields.publisher = publisher;
    if (genres) gameFields.genres = genres;
    if (images) gameFields.images = images; // Sửa ở đây

    try {
        let game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }

        game = await Game.findByIdAndUpdate(
            req.params.id,
            { $set: gameFields },
            { new: true, runValidators: true } // Thêm runValidators để kiểm tra mảng images
        );

        res.json(game);
    } catch (err)
        {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/games/:id
// @desc    Delete a game
// @access  Admin Only
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }
        await game.deleteOne();
        res.json({ msg: 'Game removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Game not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/games
// @desc    Get all games with filtering, searching, and sorting
// @access  Public
router.get('/', async (req, res) => {
    try {
        // --- Xây dựng đối tượng query cho MongoDB ---
        const query = {};

        // 1. Xử lý Search (theo title và developer)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i'); // 'i' for case-insensitive
            query.$or = [
                { title: searchRegex },
                { developer: searchRegex }
            ];
        }

        // 2. Xử lý Lọc theo Genre
        if (req.query.genre) {
            // Nếu genre là 'All' thì không cần thêm vào query
            if (req.query.genre !== 'All') {
                query.genres = req.query.genre;
            }
        }

        // 3. Xử lý Lọc theo Giá
        if (req.query.maxPrice) {
            // Mongoose sẽ hiểu { price: { $lte: value } }
            query.price = { $lte: Number(req.query.maxPrice) };
        }
        
        // --- Thực thi query ---
        const games = await Game.find(query).sort({ releaseDate: -1 });

        res.json(games);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;