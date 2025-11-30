'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

export default function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery] = useDebounce(query, 500);
    const isAI = searchParams.get('ai') === 'true';

    useEffect(() => {
        const currentQuery = searchParams.get('query') || '';

        // Only push if the debounced query is different from what's in the URL
        if (debouncedQuery === currentQuery) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debouncedQuery) {
            params.set('query', debouncedQuery);
        } else {
            params.delete('query');
        }
        // Reset page when searching
        params.set('page', '1');

        router.push(`/search?${params.toString()}`);
    }, [debouncedQuery]); // Only depend on debouncedQuery to avoid infinite loop

    return (
        <div className="relative w-full max-w-2xl">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isAI ? 'text-indigo-500' : 'text-gray-400'}`}>
                {isAI ? (
                    <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                ) : (
                    <Search className="w-5 h-5" />
                )}
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAI ? "Décrivez ce que vous cherchez (ex: PC portable gamer puissant)..." : "Rechercher un produit, une marque..."}
                className={`block w-full pl-11 pr-4 py-3 border rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${isAI
                        ? 'border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200'
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
            />
            {isAI && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-[10px] font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        AI BETA
                    </span>
                </div>
            )}
        </div>
    );
}
