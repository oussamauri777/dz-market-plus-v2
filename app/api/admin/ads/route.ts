import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';

export async function GET(req: Request) {
    try {
        await requireAdmin(req);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (status) {
            query.status = status;
        }

        const total = await Ad.countDocuments(query);
        const ads = await Ad.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            ads: ads.map((a) => ({
                ...a,
                _id: a._id.toString(),
                user: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(a.user as any),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    _id: (a.user as any)._id.toString(),
                },
                createdAt: a.createdAt.toISOString(),
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('[ADMIN_ADS_GET]', error);
        return createAdminResponse(error);
    }
}
