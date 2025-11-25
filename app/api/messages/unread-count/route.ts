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
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await dbConnect();

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
        return new NextResponse('Internal Error', { status: 500 });
    }
}
