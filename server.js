// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Socket.IO events handling
io.on('connection', socket => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('offer', offer => {
        console.log('Received offer from sender:', offer);
        socket.broadcast.emit('offer', offer); // Forward offer to all other clients
    });

    socket.on('answer', answer => {
        console.log('Received answer from receiver:', answer);
        socket.broadcast.emit('answer', answer); // Forward answer to all other clients
    });

    socket.on('icecandidate', candidate => {
        console.log('Received ICE candidate from peer:', candidate);
        socket.broadcast.emit('icecandidate', candidate); // Forward ICE candidate to all other clients
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
