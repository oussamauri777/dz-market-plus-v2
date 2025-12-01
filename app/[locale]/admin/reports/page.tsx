'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Report {
    _id: string;
    reporter: { _id: string; name: string; email: string };
    targetType: 'ad' | 'user' | 'review';
    targetId: string;
    target: any; // Dynamic based on type
    reason: string;
    description?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reports?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/reports?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                // Refresh or update local state
                setReports(reports.filter(r => r._id !== id)); // Remove from list if we're filtering by status
            }
        } catch (error) {
            console.error('Failed to update report:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'resolved' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Resolved
                    </button>
                    <button
                        onClick={() => setFilter('dismissed')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'dismissed' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Dismissed
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-600 mt-1">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 capitalize">{report.reason}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 capitalize">
                                                {report.targetType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Reported by <span className="font-medium">{report.reporter?.name}</span> on {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                        {report.description && (
                                            <p className="text-sm text-gray-800 mt-2 bg-gray-50 p-3 rounded-lg">
                                                "{report.description}"
                                            </p>
                                        )}

                                        {/* Target Preview */}
                                        <div className="mt-4 p-4 border border-gray-100 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Reported Content</p>
                                            {report.target ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {report.targetType === 'ad' ? report.target.title :
                                                                report.targetType === 'user' ? report.target.name :
                                                                    'Review Content'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{report.targetId}</p>
                                                    </div>
                                                    {report.targetType === 'ad' && (
                                                        <Link href={`/ads/${report.targetId}`} target="_blank" className="text-primary hover:underline text-sm flex items-center gap-1">
                                                            View Ad <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-red-500 italic">Content deleted or not found</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {report.status === 'pending' && (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => updateStatus(report._id, 'resolved')}
                                            className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(report._id, 'dismissed')}
                                            className="flex items-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {reports.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                            No {filter} reports found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
