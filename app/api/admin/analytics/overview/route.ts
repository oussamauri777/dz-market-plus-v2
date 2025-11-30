import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Ad from '@/models/Ad';
import Review from '@/models/Review';
import Conversation from '@/models/Conversation';

export async function GET() {
    try {
        await requireAdmin();
        await dbConnect();

        // Basic counts
        const totalUsers = await User.countDocuments();
        const totalAds = await Ad.countDocuments();
        const activeAds = await Ad.countDocuments({ status: 'active' });
        const soldAds = await Ad.countDocuments({ status: 'sold' });
        const totalReviews = await Review.countDocuments();
        const totalConversations = await Conversation.countDocuments();

        // Calculate total views across all ads
        const viewsAggregation = await Ad.aggregate([
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]);
        const totalViews = viewsAggregation[0]?.totalViews || 0;

        // Count favorites across all users
        const favoritesAggregation = await User.aggregate([
            { $project: { favoritesCount: { $size: { $ifNull: ['$favorites', []] } } } },
            { $group: { _id: null, totalFavorites: { $sum: '$favoritesCount' } } }
        ]);
        const totalFavorites = favoritesAggregation[0]?.totalFavorites || 0;

        // Average ad price
        const priceAggregation = await Ad.aggregate([
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]);
        const averagePrice = Math.round(priceAggregation[0]?.avgPrice || 0);

        // Growth metrics (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const newAdsThisMonth = await Ad.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Previous month for comparison
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const newUsersLastMonth = await User.countDocuments({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        const newAdsLastMonth = await Ad.countDocuments({
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        // Calculate percentage changes
        const usersGrowthPercent = newUsersLastMonth > 0
            ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
            : 0;

        const adsGrowthPercent = newAdsLastMonth > 0
            ? ((newAdsThisMonth - newAdsLastMonth) / newAdsLastMonth * 100).toFixed(1)
            : 0;

        // Active users (logged in last 30 days - approximate based on recent ads/messages)
        const activeUsers = await User.countDocuments({
            updatedAt: { $gte: thirtyDaysAgo }
        });

        return NextResponse.json({
            stats: {
                // Core metrics
                totalUsers,
                totalAds,
                activeAds,
                soldAds,

                // Engagement metrics
                totalViews,
                totalFavorites,
                totalReviews,
                totalConversations,

                // Financial metrics
                averagePrice,

                // Growth metrics
                newUsersThisMonth,
                newAdsThisMonth,
                usersGrowthPercent: parseFloat(usersGrowthPercent),
                adsGrowthPercent: parseFloat(adsGrowthPercent),
                activeUsers,
            }
        });
    } catch (error) {
        console.error('[ADMIN_ANALYTICS_OVERVIEW]', error);
        return createAdminResponse(error);
    }
}
