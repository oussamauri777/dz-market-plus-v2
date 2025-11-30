import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly BEFORE importing other modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function generateEmbeddings() {
    try {
        // Dynamic imports to ensure env vars are loaded first
        const { default: dbConnect } = await import('../lib/db');
        const { default: Ad } = await import('../models/Ad');
        const { generateEmbedding } = await import('../lib/ai');

        await dbConnect();
        console.log('Connected to DB');

        // Find ads without embeddings
        const ads = await Ad.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } }
            ]
        }).limit(50); // Process in batches

        console.log(`Found ${ads.length} ads to process`);

        for (const ad of ads) {
            console.log(`Processing: ${ad.title}`);

            // Create a rich text representation for embedding
            const textToEmbed = `
                Title: ${ad.title}
                Description: ${ad.description}
                Category: ${ad.category}
                Subcategory: ${ad.subcategory}
                Condition: ${ad.condition}
                Location: ${ad.wilaya}, ${ad.location?.commune || ''}
                Price: ${ad.price} DZD
            `.trim().replace(/\s+/g, ' ');

            let embedding: number[] = [];
            let retries = 0;
            const maxRetries = 10;

            while (retries < maxRetries) {
                try {
                    embedding = await generateEmbedding(textToEmbed);
                    break;
                } catch (error: any) {
                    // Check for rate limit error (429)
                    if (error?.statusCode === 429 || error?.message?.includes('429')) {
                        console.log(`Rate limit hit (3 RPM limit). Waiting 25 seconds... (Attempt ${retries + 1}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, 25000));
                        retries++;
                    } else {
                        console.error(`Error generating embedding:`, error);
                        break;
                    }
                }
            }

            if (embedding.length > 0) {
                ad.embedding = embedding;
                // Skip validation to handle legacy data with missing required fields
                await ad.save({ validateBeforeSave: false });
                console.log(`Saved embedding for: ${ad.title}`);
            } else {
                console.error(`Failed to generate embedding for: ${ad.title}`);
            }

            // Rate limit protection (Voyage AI limit)
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('Batch complete');
        process.exit(0);
    } catch (error) {
        console.error('Script Error:', error);
        process.exit(1);
    }
}

generateEmbeddings();
