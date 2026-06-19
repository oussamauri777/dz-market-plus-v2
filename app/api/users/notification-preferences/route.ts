import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIdFromRequest } from '@/lib/mobile-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await dbConnect();
        const user = await User.findById(userId).select('notificationPreferences');
        if (!user) return new NextResponse("User not found", { status: 404 });

        return NextResponse.json(user.notificationPreferences || { pushMessages: true, pushAds: true, emailNotifications: true });
    } catch (error) {
        console.error('[NOTIF_PREFS_GET]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { pushMessages, pushAds, emailNotifications } = body;

        await dbConnect();
        const updated = await User.findByIdAndUpdate(
            userId,
            { notificationPreferences: { pushMessages, pushAds, emailNotifications } },
            { new: true }
        ).select('notificationPreferences');

        if (!updated) return new NextResponse("User not found", { status: 404 });

        return NextResponse.json(updated.notificationPreferences);
    } catch (error) {
        console.error('[NOTIF_PREFS_PUT]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
