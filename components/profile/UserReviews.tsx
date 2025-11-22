'use client';

import { useState, useEffect } from 'react';
import ReviewList from '../reviews/ReviewList';

interface UserReviewsProps {
    userId: string;
}

export default function UserReviews({ userId }: UserReviewsProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?targetUserId=${userId}`);
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

        if (userId) {
            fetchReviews();
        }
    }, [userId]);

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="bg-white shadow sm:rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">My Reviews ({reviews.length})</h2>
            <ReviewList reviews={reviews} />
        </div>
    );
}
