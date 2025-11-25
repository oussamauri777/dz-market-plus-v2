import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import { PipelineStage } from 'mongoose';

export interface SearchParams {
    query?: string;
    category?: string;
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
}

export async function searchAds(params: SearchParams) {
    const {
        query,
        category,
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
        limit = '20'
    } = params;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    await dbConnect();

    const pipeline: PipelineStage[] = [];

    // 1. Match active ads
    pipeline.push({ $match: { status: 'active' } });

    // 2. Text Search
    if (query) {
        pipeline.push({
            $match: {
                $text: { $search: query }
            }
        });
    }

    // 3. Filters
    if (category) {
        pipeline.push({ $match: { category } });
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
                    $function: {
                        body: function (lat1: number, lon1: number, lat2: number, lon2: number) {
                            if (!lat1 || !lon1 || !lat2 || !lon2) return null;
                            const R = 6371e3;
                            const φ1 = lat1 * Math.PI / 180;
                            const φ2 = lat2 * Math.PI / 180;
                            const Δφ = (lat2 - lat1) * Math.PI / 180;
                            const Δλ = (lon2 - lon1) * Math.PI / 180;

                            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                                Math.cos(φ1) * Math.cos(φ2) *
                                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                            return R * c;
                        },
                        args: ["$location.latitude", "$location.longitude", latitude, longitude],
                        lang: "js"
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
            data: dataPipeline
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
