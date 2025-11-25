import { Link } from '@/i18n/routing';
import CategoryGrid from '@/components/home/CategoryGrid';
import TrendingAds from '@/components/home/TrendingAds';
import RecommendedAds from '@/components/home/RecommendedAds';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import Hero from '@/components/home/Hero';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-12">
          <CategoryGrid />
        </div>

        <div className="pb-20 space-y-12">
          <TrendingAds />
          <RecommendedAds />
          <RecentlyViewed />

          <div className="text-center mt-12">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
            >
              Explorer toutes les annonces
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
