require('dotenv').config({ path: '.env.local' });
const dbConnect = require('../lib/db').default;
const Ad = require('../models/Ad').default;

const CLOUDINARY_PLACEHOLDER = 'https://res.cloudinary.com/duwk2v3ej/image/upload/v1763766478/bkw0gghgxf2m9d5aiapb.jpg';

async function migrateImages() {
    try {
        await dbConnect();
        console.log('Connected to database...');

        const ads = await Ad.find({
            $or: [
                { images: { $elemMatch: { $regex: 'dummyimage.com' } } },
                { images: { $size: 0 } }
            ]
        });

        console.log(`Found ${ads.length} ads to update.`);

        let updatedCount = 0;
        for (const ad of ads) {
            // Replace dummy images or add placeholder if empty
            const newImages = ad.images.map((img: string) =>
                img.includes('dummyimage.com') ? CLOUDINARY_PLACEHOLDER : img
            );

            if (newImages.length === 0) {
                newImages.push(CLOUDINARY_PLACEHOLDER);
            }

            ad.images = newImages;
            await ad.save();
            updatedCount++;
        }

        console.log(`Successfully updated ${updatedCount} ads.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateImages();
