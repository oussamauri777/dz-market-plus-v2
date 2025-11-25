'use client';

import ReviewList from '../reviews/ReviewList';

interface UserReviewsProps {
    userId: string;
}

export default function UserReviews({ userId }: UserReviewsProps) {
    return (
        <div className="bg-white shadow sm:rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">My Reviews</h2>
            <ReviewList sellerId={userId} />
        </div>
    );
}
