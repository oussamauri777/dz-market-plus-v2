import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function requireAdmin(req?: Request) {
    // 1. Try session-based auth (for web)
    const session = await getServerSession(authOptions);
    if (session?.user) {
        if (session.user.role !== 'admin') {
            throw new Error('Forbidden - Admin access required');
        }
        return session.user;
    }

    // 2. Fall back to Bearer token auth (for mobile)
    if (req) {
        const authHeader = req.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            try {
                const jwtSecret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
                const decoded = jwt.verify(token, jwtSecret) as { id?: string; email?: string; role?: string };
                if (decoded && decoded.role === 'admin') {
                    await dbConnect();
                    const user = await User.findById(decoded.id);
                    if (user && user.role === 'admin') {
                        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, image: user.image };
                    }
                }
            } catch {
                // Token invalid or expired — fall through to error
            }
        }
    }

    throw new Error('Unauthorized');
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
