const mongoose = require('mongoose');
const { Schema } = mongoose;

const friendSchema = new Schema({
    userId: { 
        type: Number, 
        required: true 
    },
    friendId: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        required: true,
        enum: ['pending', 'accepted'],
        default: 'pending'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

friendSchema.index({ userId: 1, status: 1 });
friendSchema.index({ friendId: 1, status: 1 });

friendSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

mongoose.model('friends', friendSchema);

