import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Pusher from 'pusher';
import { getUserIdFromRequest } from '@/lib/mobile-auth';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        let userId = session?.user?.id || getUserIdFromRequest(req);
        let userName = session?.user?.name || 'Mobile User';
        let userEmail = session?.user?.email || '';
        let userImage = session?.user?.image || '';

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Fetch user data for presence channels if not from web session
        if (!session?.user) {
            const User = require('@/models/User').default || require('@/models/User');
            const user = await User.findById(userId).lean();
            if (user) {
                userName = user.name;
                userEmail = user.email;
                userImage = user.image;
            }
        }

        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get('socket_id');
        const channelName = params.get('channel_name');

        if (!socketId || !channelName) {
            return new NextResponse('Missing parameters', { status: 400 });
        }

        // Determine channel type and authorize
        if (channelName.startsWith('presence-')) {
            const presenceData = {
                user_id: userId,
                user_info: {
                    name: userName,
                    email: userEmail,
                    image: userImage,
                },
            };
            const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData);
            return NextResponse.json(authResponse);
        } else {
            // Private channel
            const authResponse = pusher.authorizeChannel(socketId, channelName);
            return NextResponse.json(authResponse);
        }
    } catch (error) {
        console.error('[PUSHER_AUTH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
