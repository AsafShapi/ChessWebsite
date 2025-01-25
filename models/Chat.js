const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    senderId: { type: Number, required: true },
    receiverId: { type: Number, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

chatSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });

mongoose.model('chats', chatSchema);

