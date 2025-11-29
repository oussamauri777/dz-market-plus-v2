import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Pusher from 'pusher';

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

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
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
                user_id: session.user.id,
                user_info: {
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
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
