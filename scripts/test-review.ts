require('dotenv').config({ path: '.env.local' });
const dbConnect = require('../lib/db').default;
const Review = require('../models/Review').default;
const User = require('../models/User').default;
const Ad = require('../models/Ad').default;

async function testReview() {
    try {
        await dbConnect();
        console.log('Connected to database...');

        // Find a user to be the reviewer (not the admin/seller if possible)
        const reviewer = await User.findOne({ email: { $ne: 'admin@dzmarket.com' } });
        if (!reviewer) {
            console.log('No reviewer found. Please create a user first.');
            process.exit(0);
        }

        // Find an ad to review
        const ad = await Ad.findOne({ user: { $ne: reviewer._id } });
        if (!ad) {
            console.log('No ad found to review.');
            process.exit(0);
        }

        console.log(`Reviewer: ${reviewer.name} (${reviewer._id})`);
        console.log(`Ad: ${ad.title} (${ad._id})`);
        console.log(`Target User: ${ad.user}`);

        // Check if review already exists
        const existingReview = await Review.findOne({ reviewer: reviewer._id, ad: ad._id });
        if (existingReview) {
            console.log('Review already exists. Deleting it for test...');
            await Review.deleteOne({ _id: existingReview._id });
        }

        // Create a review
        const review = await Review.create({
            reviewer: reviewer._id,
            targetUser: ad.user,
            ad: ad._id,
            rating: 5,
            comment: 'Great seller! Highly recommended.',
        });

        console.log('Review created successfully:', review);

        // Verify it can be fetched
        const fetchedReview = await Review.findById(review._id).populate('reviewer');
        console.log('Fetched Review:', fetchedReview.comment);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testReview();
