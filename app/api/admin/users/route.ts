import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        await requireAdmin(req);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }
            : {};

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ _id: -1 }) // Sort by _id (contains timestamp) instead of createdAt for backward compatibility
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        console.log('[ADMIN_USERS_GET] Found', users.length, 'users, total:', total, 'query:', JSON.stringify(query));
        if (users.length > 0) {
            console.log('[ADMIN_USERS_GET] First user:', { id: users[0]._id, name: users[0].name, createdAt: users[0].createdAt });
        }

        return NextResponse.json({
            users: users.map((u) => ({
                ...u,
                _id: u._id.toString(),
                createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('[ADMIN_USERS_GET]', error);
        return createAdminResponse(error);
    }
}
