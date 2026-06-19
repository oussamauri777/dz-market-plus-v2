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
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin', 'user'],
        default: 'buyer',
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
    resetPasswordToken: {
        type: String,
        required: false,
    },
    resetPasswordExpires: {
        type: Date,
        required: false,
    },
    lastPostDate: {
        type: Date,
    },
    notificationPreferences: {
        pushMessages: { type: Boolean, default: true },
        pushAds: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
    },
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
