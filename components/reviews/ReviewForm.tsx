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

    const [showFixButton, setShowFixButton] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Veuillez sélectionner une note');
            return;
        }

        setLoading(true);
        setError('');
        setShowFixButton(false);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUserId,
                    adId,
                    rating,
                    comment,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue');
                if (data.error && data.error.includes('E11000') && data.error.includes('reviewer_1_ad_1')) {
                    setShowFixButton(true);
                }
            } else {
                setRating(0);
                setComment('');
                if (onSuccess) onSuccess();
                router.refresh();
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleFixDatabase = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/fix-reviews');
            const data = await res.json();
            if (data.success) {
                setError('Base de données réparée. Veuillez réessayer de soumettre votre avis.');
                setShowFixButton(false);
            } else {
                setError('Impossible de réparer la base de données: ' + JSON.stringify(data));
            }
        } catch (e) {
            setError('Erreur lors de la réparation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Laisser un avis</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                    {showFixButton && (
                        <div className="mt-2">
                            <p className="mb-2 font-bold">Une erreur de base de données a été détectée (index obsolète).</p>
                            <button
                                type="button"
                                onClick={handleFixDatabase}
                                className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors"
                            >
                                Réparer la base de données
                            </button>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note
                    </label>
                    <StarRating rating={rating} setRating={setRating} readOnly={false} size={28} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commentaire
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Partagez votre expérience..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Traitement...' : 'Publier l\'avis'}
                </button>
            </form>
        </div>
    );
}
