import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import '@/models/User'; // Ensure User model is registered for population
import { PipelineStage } from 'mongoose';
import { analyzeQuery, generateEmbedding, cosineSimilarity } from '@/lib/ai';

export interface SearchParams {
    query?: string;
    category?: string;
    subcategory?: string;
    wilaya?: string;
    commune?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    hasPhotos?: string;
    lat?: string;
    lng?: string;
    radius?: string;
    sort?: string;
    page?: string;
    limit?: string;
    ai?: string; // New parameter
}

export async function searchAds(params: SearchParams) {
    const {
        query,
        category,
        subcategory,
        wilaya,
        commune,
        minPrice,
        maxPrice,
        condition,
        hasPhotos,
        lat,
        lng,
        radius,
        sort = 'newest',
        page = '1',
        limit = '20',
        ai
    } = params;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    await dbConnect();

    // AI SEARCH PATH
    if (ai === 'true' && query) {
        try {
            // 1. Analyze Intent
            const intent = await analyzeQuery(query);

            // 2. Generate Embedding
            const searchContext = `${query} ${intent.keywords.join(' ')} ${intent.filters.join(' ')}`;
            const queryEmbedding = await generateEmbedding(searchContext);

            if (queryEmbedding.length > 0) {
                // 3. Fetch Candidates (with filters if possible)
                const filter: any = { status: 'active', embedding: { $exists: true } };

                // Apply basic filters if they exist in the intent or params
                // Note: We prioritize explicit params over intent for filters like location
                if (wilaya) filter.wilaya = wilaya;
                if (commune) filter['location.commune'] = commune;
                if (minPrice) filter.price = { ...filter.price, $gte: parseInt(minPrice) };
                if (maxPrice) filter.price = { ...filter.price, $lte: parseInt(maxPrice) };

                // Fetch candidates
                const candidates = await Ad.find(filter).select('+embedding').lean();

                // 4. Rank
                const rankedAds = candidates.map((ad: any) => ({
                    ...ad,
                    _id: ad._id.toString(),
                    user: ad.user ? { ...ad.user, _id: ad.user._id?.toString() || ad.user.toString() } : null,
                    createdAt: ad.createdAt.toISOString(),
                    score: cosineSimilarity(queryEmbedding, ad.embedding),
                    embedding: undefined
                }))
                    .sort((a, b) => b.score - a.score)
                    .slice(skip, skip + limitNum); // Manual pagination

                // Fetch user details for the ranked ads (since .lean() might not populate)
                // Actually, let's just do a second lookup or ensure populate works.
                // For simplicity/speed, let's assume candidates need population if we want user details.
                // But Ad.find().populate('user') works.

                // Let's re-fetch the top N IDs with population to be safe and consistent
                const topIds = rankedAds.map(ad => ad._id);
                const populatedAds = await Ad.find({ _id: { $in: topIds } })
                    .populate('user', '-password -email -role')
                    .lean();

                // Re-order to match ranking
                const finalAds = topIds.map(id => {
                    const ad = populatedAds.find(p => p._id.toString() === id);
                    return {
                        ...ad,
                        _id: ad?._id.toString(),
                        user: { ...ad?.user, _id: ad?.user?._id.toString() },
                        createdAt: ad?.createdAt.toISOString(),
                        score: rankedAds.find(r => r._id === id)?.score
                    };
                });

                return {
                    ads: finalAds,
                    pagination: {
                        total: candidates.length,
                        page: pageNum,
                        limit: limitNum,
                        pages: Math.ceil(candidates.length / limitNum)
                    },
                    intent // Return intent for UI
                };
            }
        } catch (error) {
            console.error('AI Search failed, falling back to regular search:', error);
            // Fallback to regular search below
        }
    }

    // REGULAR SEARCH PATH (Existing Logic)
    const pipeline: PipelineStage[] = [];

    // 1. Text Search (Must be first)
    if (query) {
        pipeline.push({
            $match: {
                $text: { $search: query }
            }
        });
    }

    // 2. Match active ads
    pipeline.push({ $match: { status: 'active' } });

    // 3. Filters
    if (category) {
        pipeline.push({ $match: { category } });
    }

    if (subcategory) {
        pipeline.push({ $match: { subcategory } });
    }

    if (wilaya) {
        pipeline.push({ $match: { wilaya } });
    }

    if (commune) {
        pipeline.push({ $match: { 'location.commune': commune } });
    }

    if (condition) {
        pipeline.push({ $match: { condition } });
    }

    if (minPrice || maxPrice) {
        const priceFilter: any = {};
        if (minPrice) priceFilter.$gte = parseInt(minPrice);
        if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
        pipeline.push({ $match: { price: priceFilter } });
    }

    if (hasPhotos === 'true') {
        pipeline.push({ $match: { images: { $not: { $size: 0 } } } });
    }

    // 4. Geospatial Filter
    if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const maxDistance = (parseInt(radius || '50')) * 1000;

        pipeline.push({
            $addFields: {
                distance: {
                    $let: {
                        vars: {
                            dLat: { $degreesToRadians: { $subtract: [latitude, "$location.latitude"] } },
                            dLon: { $degreesToRadians: { $subtract: [longitude, "$location.longitude"] } },
                            lat1: { $degreesToRadians: "$location.latitude" },
                            lat2: { $degreesToRadians: latitude }
                        },
                        in: {
                            $let: {
                                vars: {
                                    a: {
                                        $add: [
                                            { $pow: [{ $sin: { $divide: ["$$dLat", 2] } }, 2] },
                                            {
                                                $multiply: [
                                                    { $cos: "$$lat1" },
                                                    { $cos: "$$lat2" },
                                                    { $pow: [{ $sin: { $divide: ["$$dLon", 2] } }, 2] }
                                                ]
                                            }
                                        ]
                                    }
                                },
                                in: {
                                    $multiply: [
                                        6371000,
                                        2,
                                        {
                                            $atan2: [
                                                { $sqrt: "$$a" },
                                                { $sqrt: { $subtract: [1, "$$a"] } }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        });

        if (radius) {
            pipeline.push({ $match: { distance: { $lte: maxDistance } } });
        }
    }

    // 5. Sorting
    let sortStage: any = {};
    switch (sort) {
        case 'price_asc':
            sortStage = { price: 1 };
            break;
        case 'price_desc':
            sortStage = { price: -1 };
            break;
        case 'oldest':
            sortStage = { createdAt: 1 };
            break;
        case 'distance':
            if (lat && lng) {
                sortStage = { distance: 1 };
            } else {
                sortStage = { createdAt: -1 };
            }
            break;
        case 'newest':
        default:
            sortStage = { createdAt: -1 };
            break;
    }
    pipeline.push({ $sort: sortStage });

    // 6. Pagination & Lookup
    const dataPipeline: PipelineStage[] = [
        { $skip: skip },
        { $limit: limitNum },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                'user.password': 0,
                'user.email': 0,
                'user.role': 0
            }
        }
    ];

    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: dataPipeline as any
        }
    });

    const result = await Ad.aggregate(pipeline);

    const ads = result[0].data.map((ad: any) => ({
        ...ad,
        _id: ad._id.toString(),
        user: {
            ...ad.user,
            _id: ad.user._id.toString()
        },
        createdAt: ad.createdAt.toISOString()
    }));

    return {
        ads,
        pagination: {
            total: result[0].metadata[0]?.total || 0,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil((result[0].metadata[0]?.total || 0) / limitNum)
        }
    };
}
