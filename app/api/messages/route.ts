import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Ad from '@/models/Ad';
import Notification from '@/models/Notification';
import { pusherServer } from '@/lib/pusher';
import { sendPushToUser } from '@/lib/services/fcm';
import { getUserIdFromRequest } from '@/lib/mobile-auth';

// GET - Fetch messages for a conversation
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');

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
            (p: any) => p.toString() === userId
        );

        if (!isParticipant) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Fetch messages
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'name')
            .sort({ createdAt: 1 })
            .lean();

        // Format response
        const formattedMessages = messages.map((msg) => ({
            ...msg,
            _id: msg._id.toString(),
            conversation: msg.conversation.toString(),
            sender: {
                ...(msg.sender as any),
                _id: (msg.sender as any)._id.toString(),
            },
            createdAt: msg.createdAt.toISOString(),
        }));

        return NextResponse.json(formattedMessages);
    } catch (error) {
        console.error('[MESSAGES_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// POST - Send a new message
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { conversationId, content, type, fileUrl, fileName } = await req.json();

        if (!conversationId || (!content && !fileUrl)) {
            return new NextResponse('Missing fields', { status: 400 });
        }

        await dbConnect();

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return new NextResponse('Conversation not found', { status: 404 });
        }

        const isParticipant = conversation.participants.some(
            (p: any) => p.toString() === userId
        );

        if (!isParticipant) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            content: content || (type === 'image' ? 'Sent an image' : type === 'audio' ? 'Sent a voice message' : 'Sent a file'),
            type: type || 'text',
            fileUrl,
            fileName,
        });

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: content ? content.substring(0, 100) : (type === 'image' ? '📷 Image' : type === 'audio' ? '🎤 Voice Message' : '📎 File'),
            lastMessageAt: new Date(),
        });

        // Populate sender info
        await message.populate('sender', 'name');

        // Create notification for recipient
        const recipientId = conversation.participants.find(
            (p: any) => p.toString() !== userId
        );
        if (recipientId) {
            const senderName = (message.sender as any)?.name || 'Someone';
            const adDoc = await Ad.findById(conversation.ad).select('title').lean();
            await Notification.create({
                user: recipientId,
                type: 'new_message',
                title: senderName,
                body: content
                    ? content.substring(0, 120)
                    : type === 'image' ? '📷 Image'
                    : type === 'audio' ? '🎤 Voice Message'
                    : '📎 File',
                data: {
                    conversationId: conversationId,
                    senderId: userId,
                    adTitle: (adDoc as any)?.title || '',
                },
            });

            // Send FCM push notification
            sendPushToUser(recipientId.toString(), {
                title: senderName,
                body: content
                    ? content.substring(0, 120)
                    : type === 'image' ? '📷 Image'
                    : type === 'audio' ? '🎤 Voice Message'
                    : '📎 File',
                data: {
                    type: 'new_message',
                    conversationId: conversationId,
                    senderId: userId,
                },
            });
        }

        // Trigger Pusher event to conversation and recipient channels
        if (recipientId) {
            await pusherServer.trigger(`private-user-${recipientId}`, 'receive_message', {
                ...message.toObject(),
                _id: message._id.toString(),
                conversation: message.conversation.toString(),
                sender: {
                    ...(message.sender as any).toObject(),
                    _id: (message.sender as any)._id.toString(),
                },
                createdAt: message.createdAt.toISOString(),
            }).catch(() => {});
        }
        await pusherServer.trigger(`private-${conversationId}`, 'receive_message', {
            ...message.toObject(),
            _id: message._id.toString(),
            conversation: message.conversation.toString(),
            sender: {
                ...(message.sender as any).toObject(),
                _id: (message.sender as any)._id.toString(),
            },
            createdAt: message.createdAt.toISOString(),
        });

        return NextResponse.json({
            ...message.toObject(),
            _id: message._id.toString(),
            conversation: message.conversation.toString(),
            sender: {
                ...(message.sender as any).toObject(),
                _id: (message.sender as any)._id.toString(),
            },
            createdAt: message.createdAt.toISOString(),
        });
    } catch (error) {
        console.error('[MESSAGES_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// DELETE - Delete a message
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const messageId = searchParams.get('messageId');

        if (!messageId) {
            return new NextResponse('Missing messageId', { status: 400 });
        }

        await dbConnect();

        // Find message and verify ownership
        const message = await Message.findById(messageId);
        if (!message) {
            return new NextResponse('Message not found', { status: 404 });
        }

        if (message.sender.toString() !== userId) {
            return new NextResponse('Forbidden - You can only delete your own messages', { status: 403 });
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        // Trigger Pusher event
        await pusherServer.trigger(`private-${message.conversation.toString()}`, 'message_deleted', messageId);

        return NextResponse.json({ success: true, messageId });
    } catch (error) {
        console.error('[MESSAGES_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
