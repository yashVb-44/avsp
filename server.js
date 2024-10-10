const http = require('http');
const app = require('./app'); // Import the app
const connectDB = require('./config/db');
const { Server } = require('socket.io');
require('./config/env');

connectDB();

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now, adjust this in production
        methods: ["GET", "POST"],
    }
});
// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible in other files
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
