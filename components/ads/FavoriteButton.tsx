'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';

interface FavoriteButtonProps {
    adId: string;
    initialIsFavorite?: boolean;
    className?: string;
}

export default function FavoriteButton({ adId, initialIsFavorite = false, className = '' }: FavoriteButtonProps) {
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!session) {
            // Check localStorage for guest users
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(favorites.includes(adId));
        } else if (initialIsFavorite === undefined) {
            // Optionally fetch status if not provided and logged in (though usually passed from parent)
        }
    }, [session, adId, initialIsFavorite]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        try {
            if (session) {
                const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adId }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsFavorite(data.isFavorite);
                    router.refresh();
                }
            } else {
                // Handle guest user
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                let newFavorites;

                if (favorites.includes(adId)) {
                    newFavorites = favorites.filter((id: string) => id !== adId);
                    setIsFavorite(false);
                } else {
                    newFavorites = [...favorites, adId];
                    setIsFavorite(true);
                }

                localStorage.setItem('favorites', JSON.stringify(newFavorites));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${isFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                } ${className}`}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
    );
}
