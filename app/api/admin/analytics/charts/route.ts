import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Ad from '@/models/Ad';

export async function GET(req: Request) {
    try {
        await requireAdmin(req);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Growth data (users and ads over time)
        const growthData = await generateGrowthData(startDate, endDate);

        // Category distribution
        const categoryData = await Ad.aggregate([
            { $match: { status: { $in: ['active', 'sold'] } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Wilaya distribution (top 10)
        const wilayaData = await Ad.aggregate([
            { $match: { status: { $in: ['active', 'sold'] } } },
            { $group: { _id: '$wilaya', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Status distribution
        const statusData = await Ad.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        return NextResponse.json({
            growthData,
            categoryData: categoryData.map(item => ({
                name: item._id || 'Unknown',
                value: item.count
            })),
            wilayaData: wilayaData.map(item => ({
                name: item._id || 'Unknown',
                value: item.count
            })),
            statusData: statusData.map(item => ({
                name: item._id,
                value: item.count
            }))
        });
    } catch (error) {
        console.error('[ADMIN_ANALYTICS_CHARTS]', error);
        return createAdminResponse(error);
    }
}

async function generateGrowthData(startDate: Date, endDate: Date) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const growthData = [];

    for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const users = await User.countDocuments({
            createdAt: { $lt: nextDate }
        });

        const ads = await Ad.countDocuments({
            createdAt: { $lt: nextDate }
        });

        growthData.push({
            date: date.toISOString().split('T')[0],
            users,
            ads
        });
    }

    return growthData;
}
