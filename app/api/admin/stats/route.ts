import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Ad from '@/models/Ad';

export async function GET() {
    try {
        await requireAdmin();
        await dbConnect();

        // Get statistics
        const totalUsers = await User.countDocuments();
        const totalAds = await Ad.countDocuments();
        const activeAds = await Ad.countDocuments({ status: 'active' });
        const adminUsers = await User.countDocuments({ role: 'admin' });

        // Get recent users (last 5)
        const recentUsers = await User.find()
            .sort({ _id: -1 }) // Sort by _id for backward compatibility
            .limit(5)
            .select('name email createdAt')
            .lean();

        // Get recent ads (last 5)
        const recentAds = await Ad.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title price status createdAt')
            .lean();

        return NextResponse.json({
            stats: {
                totalUsers,
                totalAds,
                activeAds,
                adminUsers,
            },
            recentUsers: recentUsers.map((u) => ({
                ...u,
                _id: u._id.toString(),
                createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
            })),
            recentAds: recentAds.map((a) => ({
                ...a,
                _id: a._id.toString(),
                createdAt: a.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error('[ADMIN_STATS_GET]', error);
        return createAdminResponse(error);
    }
}
