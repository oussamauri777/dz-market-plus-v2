import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';

export async function GET() {
    try {
        await dbConnect();

        // Fetch top 10 ads with most views, sorted descending
        const ads = await Ad.find({ status: 'active' })
            .sort({ views: -1 })
            .limit(10)
            .populate('user', 'name image')
            .lean();

        return NextResponse.json(ads);
    } catch (error) {
        console.error('[TRENDING_ADS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
