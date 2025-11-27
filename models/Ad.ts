import { Schema, model, models } from 'mongoose';


const AdSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
    },
    subcategory: {
        type: String,
        required: [true, 'Please provide a subcategory'],
    },
    wilaya: {
        type: String,
        required: [true, 'Please provide a wilaya'],
    },
    location: {
        address: String,
        latitude: Number,
        longitude: Number,
        wilaya: String,
        commune: String,
    },
    images: {
        type: [String],
        default: [],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'deleted'],
        default: 'active',
    },
    condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'refurbished', 'for-parts'],
        default: 'good',
    },
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for search and filtering
AdSchema.index({
    title: 'text',
    description: 'text',
    category: 'text',
    wilaya: 'text',
    'location.address': 'text'
});
AdSchema.index({ price: 1 });
AdSchema.index({ category: 1 });
AdSchema.index({ subcategory: 1 });
AdSchema.index({ wilaya: 1 });
AdSchema.index({ createdAt: -1 });
AdSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

const Ad = models.Ad || model('Ad', AdSchema);

export default Ad;
