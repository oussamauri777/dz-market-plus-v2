import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Car, Home, Smartphone, Tv, Armchair, Shirt, Briefcase, Wrench, Dog, Dumbbell, MoreHorizontal } from 'lucide-react';

const categories = [
    { name: 'Voitures', icon: Car, slug: 'Voitures', color: 'bg-blue-100 text-blue-600' },
    { name: 'Immobilier', icon: Home, slug: 'Immobilier', color: 'bg-green-100 text-green-600' },
    { name: 'Téléphones', icon: Smartphone, slug: 'Téléphones & Électronique', color: 'bg-purple-100 text-purple-600' },
    { name: 'Multimédia', icon: Tv, slug: 'Multimédia', color: 'bg-red-100 text-red-600' },
    { name: 'Maison', icon: Armchair, slug: 'Maison & Jardin', color: 'bg-orange-100 text-orange-600' },
    { name: 'Mode', icon: Shirt, slug: 'Mode & Beauté', color: 'bg-pink-100 text-pink-600' },
    { name: 'Emploi', icon: Briefcase, slug: 'Jobs', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Services', icon: Wrench, slug: 'Services', color: 'bg-gray-100 text-gray-600' },
    { name: 'Animaux', icon: Dog, slug: 'Animaux', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Loisirs', icon: Dumbbell, slug: 'Sport & Loisirs', color: 'bg-teal-100 text-teal-600' },
];

export default function CategoryList() {
    const t = useTranslations('HomePage');

    return (
        <div className="py-12">
            <div className="flex justify-between items-end mb-8 px-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('categories')}</h2>
                <Link href="/categories" className="text-primary font-medium hover:underline text-sm">
                    Voir tout
                </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 px-4">
                {categories.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/categories?category=${cat.slug}`}
                        className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <cat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors text-center">
                            {cat.name}
                        </span>
                    </Link>
                ))}
                <Link
                    href="/categories"
                    className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all duration-300"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-600 group-hover:scale-110 transition-transform duration-300">
                        <MoreHorizontal className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 text-center">
                        Autres
                    </span>
                </Link>
            </div>
        </div>
    );
}
