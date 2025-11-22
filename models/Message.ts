import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'audio', 'file'],
        default: 'text',
    },
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String,
    },
}, {
    timestamps: true,
});

// Index for efficient querying
MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message = models.Message || model('Message', MessageSchema);

export default Message;
