'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/components/common/StarRating';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from '@/i18n/routing';

interface ReviewListProps {
    sellerId?: string;
    adId?: string;
}

export default function ReviewList({ sellerId, adId }: ReviewListProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchReviews = async (pageNum: number) => {
        try {
            let url = `/api/reviews?page=${pageNum}&limit=5`;
            if (adId) {
                url += `&adId=${adId}`;
            } else if (sellerId) {
                url += `&sellerId=${sellerId}`;
            } else {
                return;
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched reviews:', data); // Debug log
                if (pageNum === 1) {
                    setReviews(data.reviews);
                } else {
                    setReviews(prev => [...prev, ...data.reviews]);
                }
                setHasMore(data.pagination.page < data.pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
    }, [sellerId, adId]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage);
    };

    if (loading && page === 1) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            <div className="h-16 w-full bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500">Aucun avis pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                if (!review.buyer) return null;
                return (
                    <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4">
                            <Link href={`/user/${review.buyer._id}`} className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 block hover:opacity-80 transition-opacity">
                                {review.buyer.image ? (
                                    <ImageWithFallback src={review.buyer.image} alt={review.buyer.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                        {review.buyer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Link href={`/user/${review.buyer._id}`} className="font-bold text-gray-900 hover:text-primary transition-colors">
                                        {review.buyer.name}
                                    </Link>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <StarRating rating={review.rating} readOnly size={16} />
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                {review.ad && (
                                    <div className="mt-3 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg inline-block">
                                        Concerne l'annonce : <span className="font-medium text-gray-600">{review.ad.title}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {hasMore && (
                <button
                    onClick={loadMore}
                    className="w-full py-3 text-primary font-bold hover:bg-primary/5 rounded-xl transition-colors"
                >
                    Voir plus d'avis
                </button>
            )}
        </div>
    );
}
