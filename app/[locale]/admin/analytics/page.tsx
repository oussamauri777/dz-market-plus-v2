'use client';

import { useEffect, useState } from 'react';
import GrowthChart from '@/components/admin/charts/GrowthChart';
import CategoryChart from '@/components/admin/charts/CategoryChart';
import WilayaChart from '@/components/admin/charts/WilayaChart';

interface ChartData {
    growthData: Array<{ date: string; users: number; ads: number }>;
    categoryData: Array<{ name: string; value: number }>;
    wilayaData: Array<{ name: string; value: number }>;
    statusData: Array<{ name: string; value: number }>;
}

export default function AnalyticsPage() {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchChartData();
    }, [days]);

    const fetchChartData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics/charts?days=${days}`);
            if (res.ok) {
                const data = await res.json();
                setChartData(data);
            }
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-2">Detailed platform statistics and trends</p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-primary focus:border-primary"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 3 Months</option>
                    <option value={365}>Last Year</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Growth Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Growth Trends</h2>
                        <GrowthChart data={chartData?.growthData || []} />
                    </div>

                    {/* Distribution Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Ads by Category</h2>
                            <CategoryChart data={chartData?.categoryData || []} />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Locations</h2>
                            <WilayaChart data={chartData?.wilayaData || []} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
