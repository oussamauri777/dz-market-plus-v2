import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';

export function useFavorites() {
    const { data: session } = useSession();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchFavorites = useCallback(async () => {
        if (!session) {
            const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setFavorites(localFavorites);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/favorites/ids');
            if (res.ok) {
                const data = await res.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const isFavorite = useCallback((adId: string) => {
        return favorites.includes(adId);
    }, [favorites]);

    const toggleFavorite = async (adId: string) => {
        // Optimistic update
        const isCurrentlyFavorite = favorites.includes(adId);
        const newFavorites = isCurrentlyFavorite
            ? favorites.filter(id => id !== adId)
            : [...favorites, adId];

        setFavorites(newFavorites);

        if (!session) {
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            return;
        }

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adId }),
            });

            if (!res.ok) {
                // Revert on failure
                setFavorites(favorites);
                console.error('Failed to toggle favorite');
            } else {
                router.refresh();
            }
        } catch (error) {
            // Revert on error
            setFavorites(favorites);
            console.error('Error toggling favorite:', error);
        }
    };

    return {
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites: fetchFavorites
    };
}
