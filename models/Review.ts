import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ad: {
        type: Schema.Types.ObjectId,
        ref: 'Ad',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        maxLength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent multiple reviews for the same ad by the same user
ReviewSchema.index({ reviewer: 1, ad: 1 }, { unique: true });

const Review = models.Review || model('Review', ReviewSchema);

export default Review;
