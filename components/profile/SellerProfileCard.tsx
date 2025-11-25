'use client';

import Image from 'next/image';
import { MapPin, Calendar, Star, ShieldCheck, Mail, Phone, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SellerProfileCardProps {
    user: any;
    stats: {
        totalAds: number;
        totalReviews: number;
        averageRating: number;
        ratingBreakdown: any;
    };
}

export default function SellerProfileCard({ user, stats }: SellerProfileCardProps) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
            <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                        {user.image ? (
                            <Image src={user.image} alt={user.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <UserIcon size={48} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                            {user.name}
                            {user.badges?.identityVerified && (
                                <div title="Identité vérifiée">
                                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                                </div>
                            )}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
                            {user.wilaya && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {user.wilaya}
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                Membre depuis {format(new Date(user.createdAt), 'MMMM yyyy', { locale: fr })}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {user.badges?.emailVerified && (
                            <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <Mail size={12} /> Email vérifié
                            </div>
                        )}
                        {user.badges?.phoneVerified && (
                            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <Phone size={12} /> Tél vérifié
                            </div>
                        )}
                    </div>
                </div>

                {user.bio && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-2">À propos</h3>
                        <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-8">
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalAds}</div>
                        <div className="text-sm text-gray-500">Annonces publiées</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                            {stats.averageRating} <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="text-sm text-gray-500">{stats.totalReviews} avis</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-2xl">
                        <div className="text-2xl font-bold text-gray-900">100%</div>
                        <div className="text-sm text-gray-500">Taux de réponse</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
