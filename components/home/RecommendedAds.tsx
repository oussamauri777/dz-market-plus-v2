'use client';

import { useEffect, useState } from 'react';
import AdCard from '@/components/ads/AdCard';
import { Sparkles } from 'lucide-react';

export default function RecommendedAds() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ads/recommended')
            .then(res => res.json())
            .then(data => {
                setAds(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>;
    if (ads.length === 0) return null;

    return (
        <section className="py-8">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Recommandé pour vous</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ads.map((ad: any) => (
                    <AdCard key={ad._id} ad={ad} />
                ))}
            </div>
        </section>
    );
}
