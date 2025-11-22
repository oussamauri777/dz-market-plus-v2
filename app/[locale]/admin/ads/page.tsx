'use client';

import { useEffect, useState } from 'react';
import { Trash2, Search } from 'lucide-react';

interface AdData {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    status: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export default function AdsManagement() {
    const [ads, setAds] = useState<AdData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchAds();
    }, [page, search, statusFilter]);

    const fetchAds = async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status: statusFilter,
            });
            const res = await fetch(`/api/admin/ads?${params}`);
            if (res.ok) {
                const data = await res.json();
                setAds(data.ads);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (adId: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;

        try {
            const res = await fetch(`/api/admin/ads/${adId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error('Failed to delete ad:', error);
        }
    };

    const handleStatusChange = async (adId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/ads/${adId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchAds();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchAds();
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Ad Management</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-grow relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or description..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Ads Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Seller
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ads.map((ad) => (
                            <tr key={ad._id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                        {ad.description}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{ad.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{ad.price} DA</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{ad.user.name}</div>
                                    <div className="text-sm text-gray-500">{ad.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={ad.status}
                                        onChange={(e) => handleStatusChange(ad._id, e.target.value)}
                                        className={`text-sm border rounded px-2 py-1 ${ad.status === 'active'
                                                ? 'border-green-300 bg-green-50 text-green-800'
                                                : 'border-gray-300 bg-gray-50 text-gray-800'
                                            }`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(ad.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(ad._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
