import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Ad from '@/models/Ad';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        await dbConnect();

        const { id } = await params;

        // Delete user's ads first
        await Ad.deleteMany({ user: id });

        // Delete user
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[ADMIN_USER_DELETE]', error);
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
        const { role } = await req.json();

        if (!['user', 'admin'].includes(role)) {
            return new NextResponse('Invalid role', { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        return NextResponse.json({
            ...user.toObject(),
            _id: user._id.toString(),
        });
    } catch (error) {
        console.error('[ADMIN_USER_PATCH]', error);
        return createAdminResponse(error);
    }
}
