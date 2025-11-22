'use client';

import { Search, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useState } from 'react';

export default function Hero() {
    const t = useTranslations('HomePage');
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [wilaya, setWilaya] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (wilaya) params.append('wilaya', wilaya);
        router.push(`/categories?${params.toString()}`);
    };

    return (
        <div className="relative bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="#e0e7ff" />
                </svg>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                    {t('heroTitle') || 'Achetez et vendez en toute confiance'}
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    {t('heroSubtitle') || 'Le meilleur endroit pour trouver des bonnes affaires en Algérie.'}
                </p>

                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-2 sm:p-3 border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Que cherchez-vous ?"
                                className="block w-full pl-10 pr-3 py-3 border-none rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 sm:bg-transparent"
                            />
                        </div>
                        <div className="h-px sm:h-auto sm:w-px bg-gray-200 mx-2"></div>
                        <div className="flex-1 relative sm:max-w-[200px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                value={wilaya}
                                onChange={(e) => setWilaya(e.target.value)}
                                className="block w-full pl-10 pr-8 py-3 border-none rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 sm:bg-transparent appearance-none cursor-pointer"
                            >
                                <option value="">Toute l'Algérie</option>
                                <option value="Alger">Alger</option>
                                <option value="Oran">Oran</option>
                                <option value="Constantine">Constantine</option>
                                {/* Add more wilayas as needed */}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all shadow-lg hover:shadow-xl shadow-yellow-400/30"
                        >
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Quick Categories Chips */}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {['Voitures', 'Immobilier', 'Téléphones', 'Meubles'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => router.push(`/categories?category=${cat}`)}
                            className="bg-white text-gray-600 hover:text-primary hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-gray-200 shadow-sm"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
