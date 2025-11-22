'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
    targetUserId: string;
    adId: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ targetUserId, adId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId, adId, rating, comment }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Rate this Seller</h3>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <StarRating rating={rating} setRating={setRating} size={24} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                    placeholder="Share your experience..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
