import { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['new_message', 'ad_update', 'ad_approved', 'ad_sold', 'review_received', 'system'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    data: {
        type: Schema.Types.Mixed,
        default: {},
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = models.Notification || model('Notification', NotificationSchema);

export default Notification;
