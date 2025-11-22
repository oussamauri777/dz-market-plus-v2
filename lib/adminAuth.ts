import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    if (session.user.role !== 'admin') {
        throw new Error('Forbidden - Admin access required');
    }

    return session.user;
}

export function createAdminResponse(error: unknown) {
    if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        if (error.message.includes('Forbidden')) {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }
    return new NextResponse('Internal Error', { status: 500 });
}
