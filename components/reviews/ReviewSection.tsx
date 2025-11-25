'use client';

import { useState } from 'react';
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
    const [refreshKey, setRefreshKey] = useState(0);

    const isSeller = session?.user?.id === targetUserId;

    const handleReviewSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Seller Reviews</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <ReviewList key={refreshKey} sellerId={targetUserId} />
                </div>

                <div>
                    {session ? (
                        !isSeller ? (
                            <ReviewForm
                                targetUserId={targetUserId}
                                adId={adId}
                                onSuccess={handleReviewSuccess}
                            />
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
                                You cannot review your own ad.
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
