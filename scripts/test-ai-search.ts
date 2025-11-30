import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSearch(query: string) {
    try {
        // Dynamic imports
        const { default: dbConnect } = await import('../lib/db');
        const { default: Ad } = await import('../models/Ad');
        const { analyzeQuery, generateEmbedding, cosineSimilarity } = await import('../lib/ai');

        await dbConnect();
        console.log(`\nTesting search for: "${query}"`);

        // 1. Analyze
        console.log('Analyzing query...');
        const intent = await analyzeQuery(query);
        console.log('Intent:', JSON.stringify(intent, null, 2));

        // 2. Embed
        console.log('Generating embedding...');
        const searchContext = `${query} ${intent.keywords.join(' ')} ${intent.filters.join(' ')}`;
        const queryEmbedding = await generateEmbedding(searchContext);

        if (queryEmbedding.length === 0) {
            console.error('Failed to generate embedding');
            return;
        }

        // 3. Search
        console.log('Fetching candidates...');
        const candidates = await Ad.find({ embedding: { $exists: true } }).select('+embedding').lean();
        console.log(`Found ${candidates.length} candidates with embeddings`);

        const results = candidates.map((ad: any) => {
            const similarity = cosineSimilarity(queryEmbedding, ad.embedding);
            return {
                title: ad.title,
                price: ad.price,
                category: ad.category,
                score: similarity
            };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        console.log('\nTop 5 Results:');
        results.forEach(r => console.log(`- [${r.score.toFixed(4)}] ${r.title} (${r.price} DZD) - ${r.category}`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

// Run a test
testSearch("phone for gaming");
