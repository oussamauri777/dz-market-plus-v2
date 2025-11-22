'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, Shield } from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalAds: number;
    activeAds: number;
    adminUsers: number;
}

interface RecentUser {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface RecentAd {
    _id: string;
    title: string;
    price: number;
    status: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentAds, setRecentAds] = useState<RecentAd[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setRecentUsers(data.recentUsers);
                setRecentAds(data.recentAds);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                        </div>
                        <Users className="h-12 w-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Ads</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.totalAds || 0}</p>
                        </div>
                        <FileText className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Ads</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.activeAds || 0}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-emerald-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Admins</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.adminUsers || 0}</p>
                        </div>
                        <Shield className="h-12 w-12 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Recent Users</h2>
                    </div>
                    <div className="p-6">
                        {recentUsers.length > 0 ? (
                            <div className="space-y-4">
                                {recentUsers.map((user) => (
                                    <div key={user._id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent users</p>
                        )}
                    </div>
                </div>

                {/* Recent Ads */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Recent Ads</h2>
                    </div>
                    <div className="p-6">
                        {recentAds.length > 0 ? (
                            <div className="space-y-4">
                                {recentAds.map((ad) => (
                                    <div key={ad._id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{ad.title}</p>
                                            <p className="text-sm text-gray-600">{ad.price} DA</p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded ${ad.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {ad.status}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(ad.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent ads</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
