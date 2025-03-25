const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes for testing
app.get('/', (req, res) => {
    res.json({ message: "Welcome to English Center API" });
});

app.get('/api/courses', (req, res) => {
    // Mock data
    const courses = [
        {
            id: 1,
            title: "Basic English",
            description: "Learn basic English grammar and vocabulary",
            price: 299,
            duration: "3 months",
            level: "beginner"
        },
        {
            id: 2,
            title: "Business English",
            description: "English for professional environment",
            price: 499,
            duration: "6 months",
            level: "intermediate"
        }
    ];
    res.json(courses);
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('message', (message) => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
