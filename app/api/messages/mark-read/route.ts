import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { pusherServer } from '@/lib/pusher';

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { conversationId } = await req.json();

        if (!conversationId) {
            return new NextResponse('Missing conversationId', { status: 400 });
        }

        await dbConnect();

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return new NextResponse('Conversation not found', { status: 404 });
        }

        const isParticipant = conversation.participants.some(
            (p: any) => p.toString() === session.user.id
        );

        if (!isParticipant) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Mark messages as read
        const result = await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: session.user.id },
                read: false,
            },
            { $set: { read: true } }
        );

        // Get the IDs of messages that were just marked as read
        const readMessages = await Message.find({
            conversation: conversationId,
            sender: { $ne: session.user.id },
            read: true,
        }).select('_id');

        const response = {
            success: true,
            count: result.modifiedCount,
            messageIds: readMessages.map(m => m._id.toString()),
        };

        if (readMessages.length > 0) {
            await pusherServer.trigger(`private-${conversationId}`, 'messages_read', {
                conversationId,
                messageIds: response.messageIds,
            });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('[MESSAGES_MARK_READ]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
