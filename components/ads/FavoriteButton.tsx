'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
    adId: string;
    className?: string;
}

export default function FavoriteButton({ adId, className = '' }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite, loading } = useFavorites();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!loading) {
            await toggleFavorite(adId);
        }
    };

    const isAdFavorite = isFavorite(adId);

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${isAdFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                } ${className}`}
            title={isAdFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart className={`w-5 h-5 ${isAdFavorite ? 'fill-current' : ''}`} />
        </button>
    );
}
