// Import các thư viện
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); 

// Cấu hình dotenv để đọc file .env
dotenv.config();

// Khởi tạo app express

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ extended: false }));

// Hàm kết nối tới MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        // Thoát khỏi tiến trình nếu không kết nối được DB
        process.exit(1);
    }
};

// Gọi hàm kết nối
connectDB();

app.use('/api/games', require('./api/routes/games'));
app.use('/api/auth', require('./api/routes/auth'));
app.use('/api/users', require('./api/routes/users'))

// Một route test
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Lắng nghe server ở cổng đã định
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});