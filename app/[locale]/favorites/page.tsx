'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdCard from '@/components/ads/AdCard';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Common');

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                if (status === 'authenticated') {
                    // Fetch from API
                    const res = await fetch('/api/favorites');
                    if (res.ok) {
                        const data = await res.json();
                        setAds(data);
                    }
                } else if (status === 'unauthenticated') {
                    // Fetch from localStorage
                    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
                    if (favoriteIds.length > 0) {
                        const res = await fetch(`/api/ads?ids=${favoriteIds.join(',')}&limit=100`);
                        if (res.ok) {
                            const data = await res.json();
                            setAds(data);
                        }
                    } else {
                        setAds([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        if (status !== 'loading') {
            fetchFavorites();
        }
    }, [status]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 w-48 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="w-8 h-8 text-primary fill-current" />
                    <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                </div>

                {ads.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ads.map((ad) => (
                            <AdCard key={ad._id} ad={ad} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun favori pour le moment</h2>
                        <p className="text-gray-500 mb-6">Explorez les annonces et sauvegardez vos coups de cœur !</p>
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                        >
                            Explorer les annonces
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
