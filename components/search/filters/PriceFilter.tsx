'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function PriceFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [min, setMin] = useState(searchParams.get('minPrice') || '');
    const [max, setMax] = useState(searchParams.get('maxPrice') || '');

    useEffect(() => {
        setMin(searchParams.get('minPrice') || '');
        setMax(searchParams.get('maxPrice') || '');
    }, [searchParams]);

    const applyPrice = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (min) params.set('minPrice', min);
        else params.delete('minPrice');

        if (max) params.set('maxPrice', max);
        else params.delete('maxPrice');

        params.set('page', '1');
        router.push(`?${params.toString()}`);
    }, [min, max, searchParams, router]);

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Prix (DA)</h3>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="Min"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="number"
                    placeholder="Max"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
            </div>
            <button
                onClick={applyPrice}
                className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
                Appliquer
            </button>
        </div>
    );
}
