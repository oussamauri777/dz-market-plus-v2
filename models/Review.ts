import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ad: {
        type: Schema.Types.ObjectId,
        ref: 'Ad',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent multiple reviews from same buyer for same ad
ReviewSchema.index({ buyer: 1, ad: 1 }, { unique: true });

const Review = models.Review || model('Review', ReviewSchema);

export default Review;
