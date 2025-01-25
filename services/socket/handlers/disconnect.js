const mongoose = require('mongoose');
const { userSockets, rooms } = require('../state');

async function handleDisconnect(io, socket) {
    if (socket.roomCode) {
        const room = rooms.get(socket.roomCode);
        if (room) {
            room.players = room.players.filter(p => p.id !== socket.user?.userId);
            
            if (room.players.length === 0) {
                rooms.delete(socket.roomCode);
            } else {
                room.gameStarted = false;
                room.countdown = null;
                
                room.messages.push({
                    type: 'system',
                    content: `${socket.user.username} has left the room`
                });
                io.to(socket.roomCode).emit('room-updated', {
                    players: room.players,
                    messages: room.messages,
                    gameStarted: room.gameStarted,
                    countdown: room.countdown
                });
            }
        }
    }

    if (socket.userId) {
        userSockets.delete(socket.userId);

        try {
            const friends = await mongoose.model('friends').find({
                status: 'accepted',
                $or: [
                    { userId: socket.userId },
                    { friendId: socket.userId }
                ]
            });

            friends.forEach(friend => {
                const friendId = friend.userId === socket.userId ? friend.friendId : friend.userId;
                const friendSocketId = userSockets.get(friendId);
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend-status', {
                        friendId: socket.userId,
                        online: false
                    });
                }
            });
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    }
    console.log('Client disconnected');
}

module.exports = handleDisconnect;

