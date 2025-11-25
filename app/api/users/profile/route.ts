import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, bio, phone, wilaya, image } = body;

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                name,
                bio,
                phone,
                wilaya,
                image,
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('[PROFILE_UPDATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
