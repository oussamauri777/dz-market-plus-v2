import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getUserIdFromRequest } from '@/lib/mobile-auth';

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { notificationIds, all } = await req.json();

        await dbConnect();

        if (all) {
            await Notification.updateMany(
                { user: userId, read: false },
                { $set: { read: true } }
            );
            return NextResponse.json({ success: true });
        }

        if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
            return new NextResponse('Missing notificationIds', { status: 400 });
        }

        await Notification.updateMany(
            { _id: { $in: notificationIds }, user: userId },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[NOTIFICATIONS_READ]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
