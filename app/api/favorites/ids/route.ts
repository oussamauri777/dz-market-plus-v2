import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json([]);
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('favorites');

        if (!user) {
            return NextResponse.json([]);
        }

        return NextResponse.json(user.favorites);
    } catch (error) {
        console.error('[FAVORITES_IDS_GET]', error);
        return NextResponse.json([], { status: 500 });
    }
}
