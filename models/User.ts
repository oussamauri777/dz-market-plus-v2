import { Schema, model, models } from 'mongoose';


const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [false, 'Please provide a password'], // Optional for OAuth users
    },
    image: {
        type: String,
    },
    phone: {
        type: String,
    },
    wilaya: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    searchHistory: {
        type: [String],
        default: [],
    },
    viewedCategories: {
        type: [String],
        default: [],
    },
    recentlyViewedAds: {
        type: [Schema.Types.ObjectId],
        ref: 'Ad',
        default: [],
    },
    bio: {
        type: String,
        default: '',
    },
    badges: {
        emailVerified: { type: Boolean, default: false },
        phoneVerified: { type: Boolean, default: false },
        identityVerified: { type: Boolean, default: false },
    },
    favorites: {
        type: [Schema.Types.ObjectId],
        ref: 'Ad',
        default: [],
    },
});

const User = models.User || model('User', UserSchema);

export default User;
