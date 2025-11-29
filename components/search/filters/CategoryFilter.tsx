'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { CATEGORIES } from '@/lib/constants/categories';
import { useRouter } from '@/i18n/routing';

export default function CategoryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');
    const currentSubcategory = searchParams.get('subcategory');

    const handleCategoryChange = useCallback((category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === currentCategory) {
            params.delete('category');
            params.delete('subcategory'); // Clear subcategory when removing category
        } else {
            params.set('category', category);
            params.delete('subcategory'); // Clear subcategory when changing category
        }
        params.set('page', '1'); // Reset page
        router.push(`?${params.toString()}`);
    }, [searchParams, currentCategory, router]);

    const handleSubcategoryChange = useCallback((category: string, subcategory: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', category);

        if (subcategory === currentSubcategory) {
            params.delete('subcategory');
        } else {
            params.set('subcategory', subcategory);
        }
        params.set('page', '1'); // Reset page
        router.push(`?${params.toString()}`);
    }, [searchParams, currentSubcategory, router]);

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Catégories</h3>
            <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                        <button
                            onClick={() => handleCategoryChange(cat.label)}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${currentCategory === cat.label
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {cat.label}
                        </button>
                        {/* Show subcategories if parent is selected */}
                        {currentCategory === cat.label && (
                            <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-2">
                                {cat.subcategories.map((sub) => (
                                    <button
                                        key={sub}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubcategoryChange(cat.label, sub);
                                        }}
                                        className={`w-full text-left px-2 py-1 rounded-md text-xs ${currentSubcategory === sub
                                            ? 'text-primary font-medium'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
