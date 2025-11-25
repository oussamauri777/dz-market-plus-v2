'use client';

import { useState } from 'react';
import StarRating from '@/components/common/StarRating';
import { useRouter } from '@/i18n/routing';

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
            setError('Veuillez sélectionner une note');
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
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Laisser un avis</h3>
            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Note</label>
                <StarRating rating={rating} setRating={setRating} size={28} />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Commentaire</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    rows={4}
                    required
                    placeholder="Partagez votre expérience avec ce vendeur..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
            >
                {loading ? 'Envoi en cours...' : 'Publier l\'avis'}
            </button>
        </form>
    );
}
