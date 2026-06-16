import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getUserIdFromRequest } from '@/lib/mobile-auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ count: 0 });
        }

        await dbConnect();

        const count = await Notification.countDocuments({ user: userId, read: false });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('[NOTIFICATIONS_UNREAD_COUNT]', error);
        return NextResponse.json({ count: 0 });
    }
}
