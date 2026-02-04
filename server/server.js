const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
// Phục vụ các file trong thư mục public (html, css, js)
app.use(express.static('public')); 

// --- CONNECT DATABASE ---
mongoose.connect('mongodb://localhost:27017/registerDB')
    .then(() => console.log('MongoDB connection successfully established.!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- SCHEMA & MODEL ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// 1. Route Đăng Ký (Register)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (error) {
        // Lỗi 11000: lỗi trùng lặp (Duplicate Key) trong MongoDB
        if (error.code === 11000) {
            return res.status(400).json({ message: "Error: The username already exists." });
        }
        res.status(500).json({ message: "Server error during registration." });
    }
});

// 2. Route Đăng Nhập (Login)
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password!" });
        }

        res.status(200).json({ 
            message: "Login successful!", 
            user: { username: user.username } 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
});

app.listen(PORT, () => {
    console.log(`The server is running at http://localhost:${PORT}`);
});