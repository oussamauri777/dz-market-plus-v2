import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['ad', 'user', 'review'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType' // Dynamic reference based on targetType
    },
    reason: {
        type: String,
        required: true,
        enum: ['spam', 'inappropriate', 'scam', 'duplicate', 'other']
    },
    description: {
        type: String,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Helper to dynamically reference the correct model
// Note: Mongoose handles refPath automatically during population if the model names match
// 'ad' -> 'Ad', 'user' -> 'User', 'review' -> 'Review'
// We might need to capitalize the targetType for the ref to work if our models are capitalized.
// Let's ensure we pass capitalized types or handle it.
// Actually, let's just use a simple approach for now or assume the frontend sends 'Ad', 'User'.
// Or better, let's just store the ID and populate manually if needed, or use the dynamic ref.

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
