'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState } from 'react';
import AdCard from '@/components/ads/AdCard';
import { Flame } from 'lucide-react';

export default function TrendingAds() {
    const [emblaRef] = useEmblaCarousel({ align: 'start', loop: false });
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ads/trending')
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
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Flame className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tendances du moment</h2>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                    {ads.map((ad: any) => (
                        <div className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0" key={ad._id}>
                            <AdCard ad={ad} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
