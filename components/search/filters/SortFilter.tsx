'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';

export default function SortFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'newest';

    const handleSortChange = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);

        if (sort === 'distance') {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        params.set('lat', position.coords.latitude.toString());
                        params.set('lng', position.coords.longitude.toString());
                        router.push(`?${params.toString()}`);
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        // Fallback to newest if location access is denied
                        params.set('sort', 'newest');
                        router.push(`?${params.toString()}`);
                    }
                );
            } else {
                console.error('Geolocation not supported');
                params.set('sort', 'newest');
                router.push(`?${params.toString()}`);
            }
        } else {
            // Remove location params if not sorting by distance
            // Optional: keep them if we want to filter by radius, but for simple sort switching it's cleaner to keep or remove based on intent.
            // For now, let's keep them if they exist, or maybe we should only add them for distance sort?
            // Actually, if the user switches away from distance sort, they might still want the location context if they had a radius filter.
            // But the prompt specifically asked about "sorting by distance".
            // Let's just update the sort param for non-distance sorts.
            router.push(`?${params.toString()}`);
        }
    };

    return (
        <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
        >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="distance">Distance</option>
        </select>
    );
}
