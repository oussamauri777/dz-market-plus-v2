'use client';

import { useEffect, useState } from 'react';
import AdCard from '@/components/ads/AdCard';
import { History } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

export default function RecentlyViewed() {
    const [ads, setAds] = useState<any[]>([]);
    const [emblaRef] = useEmblaCarousel({ align: 'start', loop: false });

    useEffect(() => {
        // Load from local storage
        const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        if (viewedIds.length > 0) {
            // Fetch details for these ads
            // Ideally we should have a bulk fetch endpoint, but for now we can filter from a general fetch or make individual requests
            // For efficiency, let's assume we might need a bulk endpoint or just fetch latest and filter client side (bad for performance)
            // Let's create a quick bulk fetch logic or just fetch individually for the top 5

            // Simulating bulk fetch by fetching individual (not optimal but works for MVP)
            Promise.all(viewedIds.slice(0, 10).map((id: string) =>
                fetch(`/api/ads/${id}`).then(res => res.ok ? res.json() : null)
            )).then(results => {
                setAds(results.filter(Boolean));
            });
        }
    }, []);

    if (ads.length === 0) return null;

    return (
        <section className="py-8 border-t border-gray-200 mt-8">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <History className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Vus récemment</h2>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                    {ads.map((ad) => (
                        <div className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0" key={ad._id}>
                            <AdCard ad={ad} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
