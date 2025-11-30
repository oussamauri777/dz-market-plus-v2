'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, Eye, Heart, Star, MessageSquare, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import GrowthChart from '@/components/admin/charts/GrowthChart';
import CategoryChart from '@/components/admin/charts/CategoryChart';
import WilayaChart from '@/components/admin/charts/WilayaChart';

interface OverviewStats {
    totalUsers: number;
    totalAds: number;
    activeAds: number;
    soldAds: number;
    totalViews: number;
    totalFavorites: number;
    totalReviews: number;
    totalConversations: number;
    averagePrice: number;
    newUsersThisMonth: number;
    newAdsThisMonth: number;
    usersGrowthPercent: number;
    adsGrowthPercent: number;
    activeUsers: number;
}

interface ChartData {
    growthData: Array<{ date: string; users: number; ads: number }>;
    categoryData: Array<{ name: string; value: number }>;
    wilayaData: Array<{ name: string; value: number }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchChartData();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/analytics/overview');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        try {
            const res = await fetch('/api/admin/analytics/charts?days=30');
            if (res.ok) {
                const data = await res.json();
                setChartData(data);
            }
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        } finally {
            setChartLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers.toLocaleString() || '0'}
                    icon={Users}
                    trend={stats?.usersGrowthPercent}
                    subtitle={`${stats?.newUsersThisMonth || 0} this month`}
                    color="blue"
                />
                <StatsCard
                    title="Total Ads"
                    value={stats?.totalAds.toLocaleString() || '0'}
                    icon={FileText}
                    trend={stats?.adsGrowthPercent}
                    subtitle={`${stats?.newAdsThisMonth || 0} this month`}
                    color="green"
                />
                <StatsCard
                    title="Active Ads"
                    value={stats?.activeAds.toLocaleString() || '0'}
                    icon={CheckCircle}
                    subtitle={`${stats?.soldAds || 0} sold`}
                    color="purple"
                />
                <StatsCard
                    title="Active Users"
                    value={stats?.activeUsers.toLocaleString() || '0'}
                    icon={TrendingUp}
                    subtitle="Last 30 days"
                    color="orange"
                />
            </div>

            {/* Engagement Stats */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Views"
                        value={stats?.totalViews.toLocaleString() || '0'}
                        icon={Eye}
                        color="indigo"
                    />
                    <StatsCard
                        title="Total Favorites"
                        value={stats?.totalFavorites.toLocaleString() || '0'}
                        icon={Heart}
                        color="pink"
                    />
                    <StatsCard
                        title="Total Reviews"
                        value={stats?.totalReviews.toLocaleString() || '0'}
                        icon={Star}
                        color="teal"
                    />
                    <StatsCard
                        title="Messages"
                        value={stats?.totalConversations.toLocaleString() || '0'}
                        icon={MessageSquare}
                        color="red"
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics</h2>
                {chartLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Growth Chart */}
                        <GrowthChart data={chartData?.growthData || []} />

                        {/* Category & Wilaya Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CategoryChart data={chartData?.categoryData || []} />
                            <WilayaChart data={chartData?.wilayaData || []} />
                        </div>
                    </div>
                )}
            </div>

            {/* Financial Metrics */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Overview</h2>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Average Ad Price</p>
                            <p className="text-3xl font-bold text-primary">{stats?.averagePrice.toLocaleString() || '0'} DA</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Listings Value</p>
                            <p className="text-3xl font-bold text-primary">
                                {((stats?.totalAds || 0) * (stats?.averagePrice || 0)).toLocaleString()} DA
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Sold Items Value</p>
                            <p className="text-3xl font-bold text-primary">
                                {((stats?.soldAds || 0) * (stats?.averagePrice || 0)).toLocaleString()} DA
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
