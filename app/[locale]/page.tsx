import { Link } from '@/i18n/routing';
import CategoryList from '@/components/categories/CategoryList';
import AdCard from '@/components/ads/AdCard';
import Hero from '@/components/home/Hero';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import { ArrowRight, Sparkles } from 'lucide-react';

async function getLatestAds() {
  try {
    await dbConnect();
    const ads = await Ad.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return ads.map((ad) => ({
      ...ad,
      _id: ad._id.toString(),
      user: ad.user.toString(),
      createdAt: ad.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return [];
  }
}

export default async function Home() {
  const ads = await getLatestAds();

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-12">
          <CategoryList />
        </div>

        <div className="pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dernières Annonces</h2>
            </div>
            <Link
              href="/categories"
              className="group flex items-center gap-1 text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              Voir tout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {ads.map((ad) => (
                <AdCard key={ad._id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600 font-medium">Aucune annonce disponible pour le moment.</p>
              <p className="text-sm text-gray-400 mt-2">Soyez le premier à publier une annonce !</p>
              <Link
                href="/ads/create"
                className="inline-block mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                Publier une annonce
              </Link>
            </div>
          )}

          {ads.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
              >
                Explorer toutes les annonces
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
