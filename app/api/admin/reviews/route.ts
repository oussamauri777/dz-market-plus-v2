import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import Ad from '@/models/Ad';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('buyer', 'name image email')
            .populate('seller', 'name image email')
            .populate('ad', 'title images');

        const total = await Review.countDocuments();

        return NextResponse.json({
            reviews,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('[ADMIN_REVIEWS_GET]', error);
        return createAdminResponse(error);
    }
}

export async function DELETE(req: Request) {
    try {
        await requireAdmin();
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
        }

        await Review.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[ADMIN_REVIEWS_DELETE]', error);
        return createAdminResponse(error);
    }
}
