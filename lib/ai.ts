import { Groq } from 'groq-sdk';
import { VoyageAIClient } from 'voyageai';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const voyage = new VoyageAIClient({
    apiKey: process.env.VOYAGE_API_KEY,
});

export interface SearchIntent {
    category?: string;
    filters: string[];
    keywords: string[];
    minPrice?: number;
    maxPrice?: number;
}

export async function analyzeQuery(query: string): Promise<SearchIntent> {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a search intent analyzer for an Algerian marketplace (Sou9). 
                    Analyze the user's search query and extract structured data.
                    
                    Output JSON format:
                    {
                        "category": "string (optional, e.g., smartphones, cars, real_estate)",
                        "filters": ["string array of specific features, e.g., 'gaming', 'long battery', 'automatic transmission']",
                        "keywords": ["string array of key search terms for vector search"],
                        "minPrice": number (optional),
                        "maxPrice": number (optional)
                    }
                    
                    Example Input: "phone with good battery for gaming under 50000"
                    Example Output:
                    {
                        "category": "smartphones",
                        "filters": ["long battery", "gaming performance"],
                        "keywords": ["gaming phone", "battery", "smartphone"],
                        "maxPrice": 50000
                    }
                    
                    Return ONLY raw JSON, no markdown.`
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No content from Groq');

        return JSON.parse(content);
    } catch (error) {
        console.error('Groq Analysis Error:', error);
        // Fallback to basic keyword extraction
        return {
            filters: [],
            keywords: query.split(' '),
        };
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await voyage.embed({
            input: text,
            model: "voyage-large-2", // High performance embedding model
            inputType: "document"
        });

        return response.data?.[0]?.embedding || [];
    } catch (error) {
        console.error('Voyage Embedding Error:', error);
        throw error; // Throw error to allow retry logic in script
    }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
