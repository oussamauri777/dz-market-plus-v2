'use client';

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import CategoryFilter from './filters/CategoryFilter';
import LocationFilter from './filters/LocationFilter';
import PriceFilter from './filters/PriceFilter';
import ConditionFilter from './filters/ConditionFilter';
import { useSearchParams } from 'next/navigation';

export default function FilterDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();

    // Close drawer when filters change (optional, maybe keep open for multiple selections)
    // For now, let's keep it open so user can apply multiple filters.

    // Count active filters
    const activeFiltersCount = Array.from(searchParams.keys()).filter(
        key => ['category', 'wilaya', 'commune', 'minPrice', 'maxPrice', 'condition'].includes(key)
    ).length;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
            >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
                {activeFiltersCount > 0 && (
                    <span className="bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <CategoryFilter />
                        <hr className="border-gray-100" />
                        <LocationFilter />
                        <hr className="border-gray-100" />
                        <PriceFilter />
                        <hr className="border-gray-100" />
                        <ConditionFilter />
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            Afficher les résultats
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
