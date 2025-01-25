const mongoose = require('mongoose');
const { userSockets } = require('../state');
const Chat = mongoose.model('chats');

function handleChatEvents(io, socket) {
    socket.on('friend-message', async (data) => {
        try {
            const { receiverId, message } = data;
            const senderId = socket.userId;

            if (!senderId || !receiverId || !message) {
                throw new Error('Invalid message data');
            }

            const chat = new Chat({
                senderId,
                receiverId,
                message
            });
            await chat.save();

            const receiverSocketId = userSockets.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('friend-message', {
                    senderId,
                    message,
                    timestamp: chat.timestamp
                });
            }

            socket.emit('message-sent', {
                success: true,
                messageId: chat._id,
                timestamp: chat.timestamp
            });

        } catch (error) {
            console.error('Error handling friend message:', error);
            socket.emit('message-sent', {
                success: false,
                error: 'Failed to send message'
            });
        }
    });

    socket.on('get-chat-history', async ({ friendId }) => {
        try {
            const userId = socket.userId;
            if (!userId || !friendId) {
                throw new Error('Invalid chat history request');
            }

            const chats = await Chat.find({
                $or: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId }
                ]
            })
            .sort({ timestamp: 1 })
            .limit(50);

            socket.emit('chat-history', chats);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            socket.emit('chat-history', { error: 'Failed to fetch chat history' });
        }
    });
}

module.exports = handleChatEvents;

