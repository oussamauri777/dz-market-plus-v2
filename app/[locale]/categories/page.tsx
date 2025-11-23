import { getTranslations } from 'next-intl/server';
import AdCard from '@/components/ads/AdCard';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import MapSearchWrapper from '@/components/MapSearchWrapper';

async function getAds(searchParams: { [key: string]: string | string[] | undefined }) {

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { status: 'active' };



    if (searchParams.category) {
        filter.category = searchParams.category;
    }

    if (searchParams.wilaya) {
        filter.wilaya = searchParams.wilaya;
    }

    if (searchParams.query) {
        filter.$or = [
            { title: { $regex: searchParams.query, $options: "i" } },
            { description: { $regex: searchParams.query, $options: "i" } },
        ];
    }

    const ads = await Ad.find(filter)
        .sort({ createdAt: -1 })
        .lean();

    return ads.map((ad: any) => ({
        ...ad,
        _id: ad._id.toString(),
        user: ad.user.toString(),
        createdAt: ad.createdAt.toISOString(),
    }));
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const t = await getTranslations('HomePage');
    const params = await searchParams;
    const ads = await getAds(params);


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-bold mb-4">Filtres</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Recherche</label>
                                <input
                                    type="text"
                                    name="query"
                                    defaultValue={params.query as string}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                                <select
                                    name="category"
                                    defaultValue={params.category as string}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">Toutes</option>
                                    <option value="Voitures">Voitures</option>
                                    <option value="Immobilier">Immobilier</option>
                                    <option value="Téléphones & Électronique">Téléphones & Électronique</option>
                                    {/* Add other categories */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Wilaya</label>
                                <select
                                    name="wilaya"
                                    defaultValue={params.wilaya as string}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">Toutes</option>
                                    <option value="Alger">Alger</option>
                                    <option value="Oran">Oran</option>
                                    {/* Add other wilayas */}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Filtrer
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold mb-6">Résultats ({ads.length})</h1>

                    {/* Map for Mobile */}
                    <div className="lg:hidden mb-6 h-[300px]">
                        <MapSearchWrapper ads={ads} />
                    </div>

                    {ads.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {ads.map((ad: any) => (
                                <AdCard key={ad._id} ad={ad} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <p className="text-gray-500">Aucune annonce trouvée.</p>
                        </div>
                    )}
                </div>

                {/* Map for Desktop */}
                <div className="hidden lg:block w-[400px] flex-shrink-0">
                    <MapSearchWrapper ads={ads} />
                </div>
            </div>
        </div>
    );
}
