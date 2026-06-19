import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIdFromRequest } from '@/lib/mobile-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);
        if (!userId) return new NextResponse('Unauthorized', { status: 401 });

        const { token } = await req.json();
        if (!token) return new NextResponse('Missing token', { status: 400 });

        await dbConnect();

        const user = await User.findById(userId).select('deviceTokens');
        if (!user) return new NextResponse('User not found', { status: 404 });

        const tokens: string[] = user.deviceTokens || [];
        if (!tokens.includes(token)) {
            tokens.push(token);
            await User.findByIdAndUpdate(userId, { deviceTokens: tokens });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DEVICE_TOKENS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);
        if (!userId) return new NextResponse('Unauthorized', { status: 401 });

        const { token } = await req.json();
        if (!token) return new NextResponse('Missing token', { status: 400 });

        await dbConnect();
        await User.findByIdAndUpdate(userId, {
            $pull: { deviceTokens: token },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DEVICE_TOKENS_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
