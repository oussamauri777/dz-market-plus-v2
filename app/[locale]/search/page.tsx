import { searchAds } from '@/lib/services/search';
import AdCard from '@/components/ads/AdCard';
import FilterSidebar from '@/components/search/FilterSidebar';
import FilterDrawer from '@/components/search/FilterDrawer';
import SortFilter from '@/components/search/filters/SortFilter';
import { Search } from 'lucide-react';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const params = await searchParams;
    const { ads, pagination } = await searchAds(params);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Top Bar (Mobile) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            defaultValue={params.query}
                        />
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
                                            href={`?page=${p}`} // Ideally use Link or router
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
