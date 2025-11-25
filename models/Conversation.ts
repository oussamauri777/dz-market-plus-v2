import { Schema, model, models } from 'mongoose';

const ConversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    ad: {
        type: Schema.Types.ObjectId,
        ref: 'Ad',
        required: true,
    },
    lastMessage: {
        type: String,
        default: '',
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Ensure unique conversation per ad between two users
// Index for efficient querying of user's conversations
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });
// Index for finding conversation by ad and participants (application logic handles uniqueness)
ConversationSchema.index({ ad: 1, participants: 1 });

const Conversation = models.Conversation || model('Conversation', ConversationSchema);

export default Conversation;
