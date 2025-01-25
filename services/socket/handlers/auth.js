const mongoose = require('mongoose');
const { userSockets } = require('../state');
const User = mongoose.model('users');

async function handleAuthentication(io, socket, userId) {
    try {
        const user = await User.findOne({ userId });
        if (user) {
            userSockets.set(userId, socket.id);
            socket.userId = userId;
            socket.user = user;
            console.log(`User ${userId} authenticated`);
            
            const friends = await mongoose.model('friends').find({
                status: 'accepted',
                $or: [
                    { userId },
                    { friendId: userId }
                ]
            });

            friends.forEach(friend => {
                const friendId = friend.userId === userId ? friend.friendId : friend.userId;
                const friendSocketId = userSockets.get(friendId);
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend-status', {
                        friendId: userId,
                        online: true
                    });
                }
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
    }
}

module.exports = handleAuthentication;

