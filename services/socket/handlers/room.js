const { userSockets, rooms } = require('../state');
const { initializeGame } = require('./game');

function handleRoomEvents(io, socket) {
    socket.on('create-room', (roomCode) => {
        if (!socket.user) return;

        rooms.set(roomCode, {
            players: [{
                id: socket.user.userId,
                username: socket.user.username
            }],
            messages: [{
                type: 'system',
                content: 'Waiting for opponent to join...'
            }],
            gameStarted: false,
            countdown: null
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit('room-created', {
            roomCode,
            messages: rooms.get(roomCode).messages
        });
    });

    socket.on('join-room', (roomCode) => {
        if (!socket.user) return;

        const room = rooms.get(roomCode);
        if (!room) {
            socket.emit('room-error', { message: 'Room not found' });
            return;
        }

        if (room.players.find(p => p.id === socket.user.userId)) {
            socket.join(roomCode);
            socket.roomCode = roomCode;
            socket.emit('room-updated', {
                players: room.players,
                messages: room.messages,
                gameStarted: room.gameStarted,
                countdown: room.countdown
            });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('room-error', { message: 'Room is full' });
            return;
        }

        room.players.push({
            id: socket.user.userId,
            username: socket.user.username
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        room.messages.push({
            type: 'system',
            content: `${socket.user.username} has joined the room`
        });

        io.to(roomCode).emit('room-updated', {
            players: room.players,
            messages: room.messages,
            gameStarted: room.gameStarted,
            countdown: room.countdown
        });

        if (room.players.length === 2) {
            startGameCountdown(io, roomCode);
        }
    });

    socket.on('match-message', (message) => {
        if (!socket.user || !socket.roomCode) return;

        const room = rooms.get(socket.roomCode);
        if (!room) return;

        const newMessage = {
            type: 'user',
            userId: socket.user.userId,
            username: socket.user.username,
            content: message
        };

        room.messages.push(newMessage);
        io.to(socket.roomCode).emit('new-match-message', newMessage);
    });
}

function startGameCountdown(io, roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.messages.push({
        type: 'system',
        content: 'Game starting in 5 seconds...'
    });

    room.countdown = 5;
    io.to(roomCode).emit('room-updated', {
        players: room.players,
        messages: room.messages,
        gameStarted: room.gameStarted,
        countdown: room.countdown
    });

    const countdownInterval = setInterval(() => {
        const currentRoom = rooms.get(roomCode);
        if (!currentRoom || currentRoom.players.length !== 2) {
            clearInterval(countdownInterval);
            return;
        }

        currentRoom.countdown--;

        if (currentRoom.countdown > 0) {
            io.to(roomCode).emit('room-updated', {
                players: currentRoom.players,
                messages: currentRoom.messages,
                gameStarted: currentRoom.gameStarted,
                countdown: currentRoom.countdown
            });
        } else {
            clearInterval(countdownInterval);
            currentRoom.gameStarted = true;
            currentRoom.countdown = null;
            
            initializeGame(roomCode);

            currentRoom.messages.push({
                type: 'system',
                content: 'Game has started!'
            });

            io.to(roomCode).emit('room-updated', {
                players: currentRoom.players,
                messages: currentRoom.messages,
                gameStarted: currentRoom.gameStarted,
                countdown: currentRoom.countdown
            });
        }
    }, 1000);
}

module.exports = handleRoomEvents;

