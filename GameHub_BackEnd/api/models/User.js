const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ['customer', 'admin'], // Chỉ cho phép 2 giá trị này
        default: 'customer'
    },
    walletBalance: { // Thêm thuộc tính ví tiền
        type: Number,
        required: true,
        default: 0 // Mặc định người dùng mới có 0 đồng trong ví
    },
     library: [{ // Thêm trường thư viện
        game: {
            type: Schema.Types.ObjectId,
            ref: 'Game' // Tham chiếu đến model 'Game'
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);