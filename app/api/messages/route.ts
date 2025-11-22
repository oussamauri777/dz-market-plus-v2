import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

// GET - Fetch messages for a conversation
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
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
            (p: any) => p.toString() === session.user.id
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

        if (!session?.user?.id) {
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
            (p: any) => p.toString() === session.user.id
        );

        if (!isParticipant) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: session.user.id,
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

        if (!session?.user?.id) {
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

        if (message.sender.toString() !== session.user.id) {
            return new NextResponse('Forbidden - You can only delete your own messages', { status: 403 });
        }

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        return NextResponse.json({ success: true, messageId });
    } catch (error) {
        console.error('[MESSAGES_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
