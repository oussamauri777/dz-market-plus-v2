import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        let filter: any = { status: 'active' };

        if (session?.user?.id) {
            const user = await User.findById(session.user.id);
            if (user && user.viewedCategories && user.viewedCategories.length > 0) {
                // Recommend ads from categories the user has viewed
                // Take the last 3 viewed categories
                const recentCategories = user.viewedCategories.slice(-3);
                filter.category = { $in: recentCategories };
            }
        }

        // If no user or no history, just return random active ads (or latest)
        // Using $sample for random if collection is small, or just sort by createdAt
        // For performance on large datasets, avoid $sample. Let's stick to latest for "Recommended" fallback

        const ads = await Ad.find(filter)
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('user', 'name image')
            .lean();

        return NextResponse.json(ads);
    } catch (error) {
        console.error('[RECOMMENDED_ADS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
