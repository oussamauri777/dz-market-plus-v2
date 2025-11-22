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
    wilaya: {
        type: String,
        required: [true, 'Please provide a wilaya'],
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Ad = models.Ad || model('Ad', AdSchema);

export default Ad;
