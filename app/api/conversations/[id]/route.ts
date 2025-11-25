import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const conversation = await Conversation.findById(id)
            .populate('participants', 'name email')
            .populate('ad', 'title images price')
            .lean();

        if (!conversation) {
            return new NextResponse('Conversation not found', { status: 404 });
        }

        // Check if user is participant
        const isParticipant = (conversation.participants as any[]).some(
            (p: any) => p._id.toString() === session.user.id
        );

        if (!isParticipant) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Format response
        const formattedConversation = {
            ...conversation,
            _id: conversation._id.toString(),
            participants: (conversation.participants as any[]).map((p: any) => ({
                ...p,
                _id: p._id.toString(),
            })),
            ad: {
                ...(conversation.ad as any),
                _id: (conversation.ad as any)._id.toString(),
            },
        };

        return NextResponse.json(formattedConversation);
    } catch (error) {
        console.error('[CONVERSATION_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
