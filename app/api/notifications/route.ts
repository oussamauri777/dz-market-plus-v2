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
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        await dbConnect();

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments({ user: userId });
        const unreadCount = await Notification.countDocuments({ user: userId, read: false });

        const formatted = notifications.map((n) => ({
            ...n,
            _id: n._id.toString(),
            user: n.user.toString(),
            createdAt: n.createdAt.toISOString(),
        }));

        return NextResponse.json({
            notifications: formatted,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
            unreadCount,
        });
    } catch (error) {
        console.error('[NOTIFICATIONS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { targetUserId, type, title, body, data } = await req.json();

        if (!targetUserId || !type || !title || !body) {
            return new NextResponse('Missing fields', { status: 400 });
        }

        await dbConnect();

        const notification = await Notification.create({
            user: targetUserId,
            type,
            title,
            body,
            data: data || {},
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('[NOTIFICATIONS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
