import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { targetUserId, adId, rating, comment } = await req.json();

        if (!targetUserId || !adId || !rating || !comment) {
            return new NextResponse('Missing fields', { status: 400 });
        }

        if (targetUserId === session.user.id) {
            return new NextResponse('Cannot review yourself', { status: 400 });
        }

        await dbConnect();

        const review = await Review.create({
            reviewer: session.user.id,
            targetUser: targetUserId,
            ad: adId,
            rating,
            comment,
        });

        return NextResponse.json(review);
    } catch (error: any) {
        console.error('[REVIEWS_POST]', error);
        if (error.code === 11000) {
            return new NextResponse('You have already reviewed this ad', { status: 400 });
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get('targetUserId');
        const adId = searchParams.get('adId');

        await dbConnect();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (targetUserId) query.targetUser = targetUserId;
        if (adId) query.ad = adId;

        const reviews = await Review.find(query)
            .populate('reviewer', 'name image')
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('[REVIEWS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
