'use client';

import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { useSession } from 'next-auth/react';

interface ReviewSectionProps {
    targetUserId: string;
    adId: string;
    sellerName: string;
}

export default function ReviewSection({ targetUserId, adId, sellerName }: ReviewSectionProps) {
    const { data: session } = useSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?targetUserId=${targetUserId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [targetUserId]);

    const isSeller = session?.user?.id === targetUserId;
    const hasReviewed = reviews.some((r) => r.reviewer._id === session?.user?.id && r.ad === adId);

    return (
        <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Seller Reviews ({reviews.length})</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <ReviewList reviews={reviews} />
                </div>

                <div>
                    {session ? (
                        !isSeller && !hasReviewed ? (
                            <ReviewForm
                                targetUserId={targetUserId}
                                adId={adId}
                                onSuccess={fetchReviews}
                            />
                        ) : isSeller ? (
                            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                You cannot review your own ad.
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                You have already reviewed this ad.
                            </div>
                        )
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                            <p className="text-gray-600 mb-4">Please log in to leave a review for {sellerName}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
