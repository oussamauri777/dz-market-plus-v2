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
ConversationSchema.index({ participants: 1, ad: 1 }, { unique: true });

const Conversation = models.Conversation || model('Conversation', ConversationSchema);

export default Conversation;
