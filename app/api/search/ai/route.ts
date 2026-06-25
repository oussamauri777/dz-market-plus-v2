import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import { analyzeQuery, generateEmbedding, cosineSimilarity } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        await dbConnect();

        // Check for API Keys
        if (!process.env.GROQ_API_KEY || !process.env.VOYAGE_API_KEY) {
            console.error('[AI_SEARCH_API] Missing API Keys:', {
                GROQ_API_KEY: !!process.env.GROQ_API_KEY,
                VOYAGE_API_KEY: !!process.env.VOYAGE_API_KEY
            });
            return NextResponse.json({ error: 'Server configuration error: Missing AI API Keys' }, { status: 500 });
        }

        // 1. Analyze Query Intent (Groq + Llama 3.1)
        const intent = await analyzeQuery(query);
        console.log('Search Intent:', intent);

        // 2. Generate Embedding for vector search (Voyage AI)
        // Combine keywords and original query for richer context
        const searchContext = `${query} ${intent.keywords.join(' ')} ${intent.filters.join(' ')}`;
        const queryEmbedding = await generateEmbedding(searchContext);

        if (queryEmbedding.length === 0) {
            return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 });
        }

        // 3. Vector Search
        // Ideally, use Atlas Vector Search ($vectorSearch stage).
        // For now, we'll fetch candidates and re-rank manually (suitable for small-medium datasets)
        // In production with millions of docs, use Atlas Vector Search index.

        // Initial filter to reduce candidate set size (using extracted category/filters)
        const filter: any = { status: 'active', embedding: { $exists: true } };

        if (intent.minPrice || intent.maxPrice) {
            filter.price = {};
            if (intent.minPrice) filter.price.$gte = intent.minPrice;
            if (intent.maxPrice) filter.price.$lte = intent.maxPrice;
        }

        // Fetch candidates with embeddings (newest first, no hard limit)
        const candidates = await Ad.find(filter)
            .select('+embedding')
            .sort({ createdAt: -1 })
            .lean();

        // 4. Re-rank using Cosine Similarity
        const results = candidates.map((ad: any) => {
            const similarity = cosineSimilarity(queryEmbedding, ad.embedding);
            return {
                ...ad,
                score: similarity,
                embedding: undefined // Remove embedding from response
            };
        })
            .sort((a, b) => b.score - a.score) // Sort by similarity desc
            .slice(0, 20); // Top 20

        return NextResponse.json({
            results,
            intent // Return intent for debugging/UI feedback
        });

    } catch (error) {
        console.error('[AI_SEARCH_API]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
