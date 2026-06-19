import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import Ad from '@/models/Ad';

export async function GET(req: Request) {
    try {
        await requireAdmin(req);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const conversations = await Conversation.find()
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('participants', 'name email image')
            .populate('ad', 'title images');

        const total = await Conversation.countDocuments();

        return NextResponse.json({
            conversations,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('[ADMIN_CONVERSATIONS_GET]', error);
        return createAdminResponse(error);
    }
}
