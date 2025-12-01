import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ count: 0 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('favorites');
        const count = user?.favorites?.length || 0;

        return NextResponse.json({ count });
    } catch (error) {
        console.error('[FAVORITES_COUNT_GET]', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
