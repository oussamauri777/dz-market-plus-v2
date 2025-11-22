require('dotenv').config({ path: '.env.local' });
const dbConnect = require('../lib/db').default;
const Ad = require('../models/Ad').default;

const IMAGE_MAP: Record<string, string> = {
    'iphone': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    'samsung': 'https://images.unsplash.com/photo-1610945265078-3858a0b5d8f4?auto=format&fit=crop&w=800&q=80',
    'macbook': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'toyota': 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80',
    'apartment': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'playstation': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
    'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'guitar': 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=800&q=80',
    'chair': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80',
    'bike': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'; // Generic sofa/furniture

async function updateImages() {
    try {
        await dbConnect();
        console.log('Connected to database...');

        const ads = await Ad.find({});
        console.log(`Found ${ads.length} ads to process.`);

        let updatedCount = 0;
        for (const ad of ads) {
            const titleLower = ad.title.toLowerCase();
            let newImage = DEFAULT_IMAGE;

            for (const [key, url] of Object.entries(IMAGE_MAP)) {
                if (titleLower.includes(key)) {
                    newImage = url;
                    break;
                }
            }

            // Only update if it's currently using the generic placeholder or dummyimage
            // We'll force update for now to ensure diversity as requested
            ad.images = [newImage];
            await ad.save();
            updatedCount++;
            console.log(`Updated "${ad.title}" with image for ${newImage === DEFAULT_IMAGE ? 'default' : 'match'}`);
        }

        console.log(`Successfully updated ${updatedCount} ads.`);
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateImages();
