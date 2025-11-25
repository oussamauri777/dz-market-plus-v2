import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await dbConnect();

        const ad = await Ad.findById(id).populate('user', 'name email phone wilaya image').lean();

        if (!ad) {
            return new NextResponse('Ad not found', { status: 404 });
        }

        return NextResponse.json({
            ...ad,
            _id: ad._id.toString(),
            user: {
                ...ad.user,
                _id: (ad.user as any)._id.toString(),
            },
            createdAt: ad.createdAt.toISOString(),
        });
    } catch (error) {
        console.error('[AD_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
