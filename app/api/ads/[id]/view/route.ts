import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIdFromRequest } from '@/lib/mobile-auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        // Increment view count
        const ad = await Ad.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!ad) {
            return new NextResponse("Ad not found", { status: 404 });
        }

        // Update user history if logged in
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: {
                    viewedCategories: ad.category,
                    recentlyViewedAds: id
                },
                // Limit history size could be done here or periodically
            });

            // Ensure recentlyViewedAds doesn't grow indefinitely (keep last 20)
            // This is a bit complex with atomic operators in one go, so we might skip for MVP
            // or do a pull/push logic.
        }

        return NextResponse.json({ views: ad.views });
    } catch (error) {
        console.error('[AD_VIEW_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
