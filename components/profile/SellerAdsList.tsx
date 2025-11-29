'use client';

import { useState, useEffect } from 'react';
import AdCard from '@/components/ads/AdCard';

interface SellerAdsListProps {
    userId: string;
}

export default function SellerAdsList({ userId }: SellerAdsListProps) {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                // We can use the existing search API but filter by user if we add that capability
                // Or use a specific endpoint. For now, let's assume we can filter by user in the search API
                // Wait, the search API doesn't explicitly support 'user' filter yet in the public interface
                // But we can add it or use a specific route.
                // Let's modify the search API to support 'user' param or just use a direct fetch here if it's simple.
                // Actually, let's use the /api/ads endpoint which we modified earlier.
                // We need to add 'user' filter to /api/ads first.

                // Let's check /api/ads again. It supports category, wilaya, query, ids.
                // I should add 'user' support to /api/ads/route.ts

                const res = await fetch(`/api/ads?user=${userId}&limit=20&status=active,sold`);
                if (res.ok) {
                    const data = await res.json();
                    setAds(data);
                }
            } catch (error) {
                console.error('Error fetching seller ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [userId]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (ads.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500">Aucune annonce active pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
                <AdCard key={ad._id} ad={ad} />
            ))}
        </div>
    );
}
