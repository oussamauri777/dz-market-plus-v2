'use client';

import { Car, Home, Smartphone, Monitor, Shirt, Briefcase, Wrench, Dog, Dumbbell, MoreHorizontal } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';

const CATEGORIES = [
    { name: 'Voitures', icon: Car, color: 'bg-blue-100 text-blue-600' },
    { name: 'Immobilier', icon: Home, color: 'bg-green-100 text-green-600' },
    { name: 'Téléphones', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    { name: 'Multimédia', icon: Monitor, color: 'bg-red-100 text-red-600' },
    { name: 'Mode', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
    { name: 'Emploi', icon: Briefcase, color: 'bg-orange-100 text-orange-600' },
    { name: 'Services', icon: Wrench, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Animaux', icon: Dog, color: 'bg-teal-100 text-teal-600' },
    { name: 'Loisirs', icon: Dumbbell, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Autres', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
];

export default function CategoryGrid() {
    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorer par Catégorie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CATEGORIES.map((cat, index) => (
                    <Link href={`/search?category=${cat.name}`} key={index}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow cursor-pointer h-full"
                        >
                            <div className={`p-4 rounded-full ${cat.color}`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <span className="font-semibold text-gray-700 text-center">{cat.name}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
