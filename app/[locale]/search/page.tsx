import { searchAds } from '@/lib/services/search';
import AdCard from '@/components/ads/AdCard';
import FilterSidebar from '@/components/search/FilterSidebar';
import FilterDrawer from '@/components/search/FilterDrawer';
import SortFilter from '@/components/search/filters/SortFilter';
import SearchInput from '@/components/search/SearchInput';
import { Search, Sparkles } from 'lucide-react';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const { ads, pagination, intent } = await searchAds(params) as any; // Type assertion for intent

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Top Bar (Mobile) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <SearchInput />
                    </div>
                    <FilterDrawer />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar (Desktop) */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Results */}
                    <div className="flex-1">
                        {/* Desktop Search Input */}
                        <div className="hidden lg:block mb-8">
                            <SearchInput />
                        </div>

                        {/* AI Intent Display */}
                        {params.ai === 'true' && intent && (
                            <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles className="w-24 h-24 text-indigo-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-bold text-indigo-900">Analyse de votre recherche</h3>
                                    </div>
                                    <p className="text-indigo-700 mb-3">
                                        Nous avons compris que vous cherchez :
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {intent.category && (
                                            <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium shadow-sm border border-indigo-100">
                                                Catégorie: {intent.category}
                                            </span>
                                        )}
                                        {intent.filters?.map((filter: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium shadow-sm border border-indigo-100">
                                                {filter}
                                            </span>
                                        ))}
                                        {intent.minPrice && (
                                            <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium shadow-sm border border-indigo-100">
                                                Min: {intent.minPrice} DA
                                            </span>
                                        )}
                                        {intent.maxPrice && (
                                            <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium shadow-sm border border-indigo-100">
                                                Max: {intent.maxPrice} DA
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {params.query ? `Résultats pour "${params.query}"` : 'Toutes les annonces'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {pagination.total} résultats trouvés
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 hidden sm:inline">Trier par:</span>
                                <SortFilter />
                            </div>
                        </div>

                        {/* Grid */}
                        {ads.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ads.map((ad: any) => (
                                    <div key={ad._id} className="h-[380px]">
                                        <AdCard ad={ad} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                                <p className="text-gray-500">
                                    Essayez de modifier vos filtres ou votre recherche.
                                </p>
                            </div>
                        )}

                        {/* Pagination (Simple) */}
                        {pagination.pages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                    const p = i + 1; // Simplified pagination logic
                                    return (
                                        <a
                                            key={p}
                                            href={`?page=${p}&query=${params.query || ''}&ai=${params.ai || ''}`}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${pagination.page === p
                                                ? 'bg-primary text-white'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {p}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
