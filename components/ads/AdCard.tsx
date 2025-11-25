import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface AdCardProps {
    ad: {
        _id: string;
        title: string;
        price: number;
        images: string[];
        wilaya: string;
        createdAt: string;
    };
}

export default function AdCard({ ad }: AdCardProps) {
    return (
        <div className="group h-full relative">
            <div className="absolute top-3 right-3 z-20">
                <FavoriteButton adId={ad._id} />
            </div>

            <Link href={`/ads/${ad._id}`} className="block h-full">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {ad.images[0] ? (
                            <Image
                                src={ad.images[0]}
                                alt={ad.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                <span className="text-sm">Pas d'image</span>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-20 opacity-60"></div>
                        <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {ad.wilaya}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {ad.title}
                        </h3>

                        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">
                                {ad.price.toLocaleString()} DA
                            </p>
                            <div className="flex items-center text-xs text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(ad.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
