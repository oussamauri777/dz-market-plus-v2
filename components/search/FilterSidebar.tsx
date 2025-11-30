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

            {/* AI Search Toggle */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-indigo-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-900">AI Search</span>
                    </div>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            if (params.get('ai') === 'true') {
                                params.delete('ai');
                            } else {
                                params.set('ai', 'true');
                            }
                            router.push(`/search?${params.toString()}`);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${searchParams.get('ai') === 'true' ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${searchParams.get('ai') === 'true' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Activez pour une recherche sémantique intelligente (ex: "téléphone pour gaming pas cher").
                </p>
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
