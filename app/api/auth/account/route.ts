import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIdFromRequest } from '@/lib/mobile-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Ad from '@/models/Ad';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Review from '@/models/Review';
import Notification from '@/models/Notification';
import Report from '@/models/Report';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        await dbConnect();

        // Delete all user data
        await Ad.deleteMany({ user: userId });
        await Message.deleteMany({ sender: userId });

        // Delete conversations where user is a participant
        await Conversation.deleteMany({ participants: userId });

        // Delete reviews about this user or by this user
        await Review.deleteMany({ seller: userId });
        await Review.deleteMany({ reviewer: userId });

        // Delete notifications
        await Notification.deleteMany({ user: userId });

        // Delete reports
        await Report.deleteMany({ reporter: userId });
        await Report.deleteMany({ reportedUser: userId });

        // Delete user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE_ACCOUNT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
