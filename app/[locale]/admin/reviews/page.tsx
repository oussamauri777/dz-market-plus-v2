'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2, User } from 'lucide-react';
import ImageWithFallback from '@/components/common/ImageWithFallback';

interface Review {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    buyer: { _id: string; name: string; image?: string; email: string };
    seller: { _id: string; name: string; image?: string; email: string };
    ad: { _id: string; title: string; images: string[] };
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews?page=${page}&limit=10`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete review:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {review.buyer?.image ? (
                                                        <ImageWithFallback src={review.buyer.image} alt={review.buyer.name} width={32} height={32} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-4 w-4 m-2 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{review.buyer?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">{review.buyer?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{review.seller?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{review.seller?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 truncate max-w-[150px]">{review.ad?.title || 'Unknown Ad'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{review.comment}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {reviews.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No reviews found</div>
                    )}
                </div>
            )}
        </div>
    );
}
