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
        router.push(`?${params.toString()}`);
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
