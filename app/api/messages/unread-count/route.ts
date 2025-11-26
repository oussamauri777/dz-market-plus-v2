import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            // Return 0 instead of error to avoid console spam
            return NextResponse.json({ unreadCount: 0 });
        }

        await dbConnect();

        // Validate if session.user.id is a valid ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(session.user.id)) {
            console.log('[UNREAD_COUNT_GET] Invalid User ID (likely OAuth ID):', session.user.id);
            return NextResponse.json({ unreadCount: 0 });
        }

        // Get all conversations where user is a participant
        const conversations = await Conversation.find({
            participants: session.user.id,
        }).select('_id');

        const conversationIds = conversations.map((c) => c._id);

        // Count unread messages in these conversations where user is NOT the sender
        const unreadCount = await Message.countDocuments({
            conversation: { $in: conversationIds },
            sender: { $ne: session.user.id },
            read: false,
        });

        return NextResponse.json({ unreadCount });
    } catch (error) {
        console.error('[UNREAD_COUNT_GET]', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
