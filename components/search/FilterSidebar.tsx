'use client';

import CategoryFilter from './filters/CategoryFilter';
import LocationFilter from './filters/LocationFilter';
import PriceFilter from './filters/PriceFilter';
import ConditionFilter from './filters/ConditionFilter';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const clearFilters = () => {
        router.push('/search');
    };

    const hasFilters = Array.from(searchParams.keys()).some(
        key => ['category', 'wilaya', 'commune', 'minPrice', 'maxPrice', 'condition'].includes(key)
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8 h-fit sticky top-24">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        Tout effacer
                    </button>
                )}
            </div>

            <div className="space-y-8 divide-y divide-gray-100">
                <div className="pt-2">
                    <CategoryFilter />
                </div>
                <div className="pt-6">
                    <LocationFilter />
                </div>
                <div className="pt-6">
                    <PriceFilter />
                </div>
                <div className="pt-6">
                    <ConditionFilter />
                </div>
            </div>
        </div>
    );
}
