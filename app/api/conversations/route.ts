import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Ad from '@/models/Ad';

// GET - List user's conversations
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await dbConnect();

        const conversations = await Conversation.find({
            participants: session.user.id,
        })
            .populate('participants', 'name email image')
            .populate('ad', 'title images')
            .sort({ lastMessageAt: -1 })
            .lean();

        // Format response with unread counts
        const formattedConversations = await Promise.all(
            conversations.map(async (conv) => {
                // Count unread messages for this user in this conversation
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    sender: { $ne: session.user.id },
                    read: false,
                });

                return {
                    ...conv,
                    _id: conv._id.toString(),
                    participants: conv.participants.map((p: any) => ({
                        ...p,
                        _id: p._id.toString(),
                    })),
                    ad: conv.ad ? {
                        ...conv.ad,
                        _id: (conv.ad as any)._id.toString(),
                    } : null,
                    unreadCount,
                };
            })
        );

        return NextResponse.json(formattedConversations);
    } catch (error) {
        console.error('[CONVERSATIONS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// POST - Create or get existing conversation
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { adId, sellerId } = await req.json();

        if (!adId || !sellerId) {
            return new NextResponse('Missing fields', { status: 400 });
        }

        await dbConnect();

        // Check if ad exists
        const ad = await Ad.findById(adId);
        if (!ad) {
            return new NextResponse('Ad not found', { status: 404 });
        }

        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
            participants: { $all: [session.user.id, sellerId] },
            ad: adId,
        });

        if (existingConversation) {
            return NextResponse.json({
                _id: existingConversation._id.toString(),
                exists: true,
            });
        }

        // Create new conversation
        const conversation = await Conversation.create({
            participants: [session.user.id, sellerId],
            ad: adId,
        });

        return NextResponse.json({
            _id: conversation._id.toString(),
            exists: false,
        });
    } catch (error) {
        console.error('[CONVERSATIONS_POST] Error:', error);
        if (error instanceof Error) {
            console.error('[CONVERSATIONS_POST] Stack:', error.stack);
        }
        return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}
