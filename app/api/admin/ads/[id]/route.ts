import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        await dbConnect();

        const { id } = await params;

        const ad = await Ad.findByIdAndDelete(id);

        if (!ad) {
            return new NextResponse('Ad not found', { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[ADMIN_AD_DELETE]', error);
        return createAdminResponse(error);
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        await dbConnect();

        const { id } = await params;
        const { status } = await req.json();

        if (!['active', 'inactive'].includes(status)) {
            return new NextResponse('Invalid status', { status: 400 });
        }

        const ad = await Ad.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!ad) {
            return new NextResponse('Ad not found', { status: 404 });
        }

        return NextResponse.json({
            ...ad.toObject(),
            _id: ad._id.toString(),
            user: ad.user.toString(),
            createdAt: ad.createdAt.toISOString(),
        });
    } catch (error) {
        console.error('[ADMIN_AD_PATCH]', error);
        return createAdminResponse(error);
    }
}
