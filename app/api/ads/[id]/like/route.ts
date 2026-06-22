import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
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

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ad = await Ad.findById(id);
        if (!ad) {
            return new NextResponse("Ad not found", { status: 404 });
        }

        const alreadyLiked = ad.likedBy?.some((uid: any) => uid.toString() === userId);

        if (alreadyLiked) {
            await Ad.findByIdAndUpdate(id, {
                $inc: { likes: -1 },
                $pull: { likedBy: userId },
            });
            return NextResponse.json({ liked: false, likes: Math.max(0, (ad.likes || 0) - 1) });
        } else {
            await Ad.findByIdAndUpdate(id, {
                $inc: { likes: 1 },
                $addToSet: { likedBy: userId },
            });
            return NextResponse.json({ liked: true, likes: (ad.likes || 0) + 1 });
        }
    } catch (error) {
        console.error('[AD_LIKE_POST]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
