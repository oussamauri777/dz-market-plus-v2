import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';

export async function GET() {
    try {
        await dbConnect();

        const ads = await Ad.find({
            $or: [
                { images: { $elemMatch: { $not: /^http/ } } },
                { images: { $elemMatch: { $regex: 'dummyimage.com' } } },
                { images: { $size: 0 } }
            ]
        }).select('title images').limit(50).lean();

        const allAds = await Ad.find({}).select('title images').limit(10).lean();

        return NextResponse.json({
            brokenOrLocalCount: ads.length,
            brokenOrLocalAds: ads,
            sampleAds: allAds
        });
    } catch (error) {
        console.error('Check images error:', error);
        return NextResponse.json({ error: 'Failed to check images' }, { status: 500 });
    }
}
