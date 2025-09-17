const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    releaseDate: {
        type: Date,
        default: Date.now
    },
    developer: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    genres: [{
        type: String,
        required: true
    }],
    // === THAY ĐỔI CHÍNH ===
    // Gộp coverImage và galleryImages thành một mảng duy nhất
    images: {
        type: [String], // Kiểu dữ liệu là một mảng các chuỗi
        required: true,
        // Đảm bảo mảng phải có ít nhất một ảnh
        validate: [v => Array.isArray(v) && v.length > 0, 'At least one image is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Game', GameSchema);