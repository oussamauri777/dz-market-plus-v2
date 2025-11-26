import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { role: 'admin' },
            { new: true }
        );

        return NextResponse.json({
            message: 'User role updated to admin',
            user: {
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
