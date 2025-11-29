'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, Link } from '@/i18n/routing';
import { MessageCircle, Phone, MapPin, Calendar, Share2, Heart, ShieldCheck, User, CheckCircle, Tag, AlertCircle, Eye } from 'lucide-react';
import ReviewSection from '@/components/reviews/ReviewSection';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import DistanceCalculator from '@/components/DistanceCalculator';

const MapPreview = dynamic(() => import('@/components/MapPreview'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>
});

interface Ad {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    wilaya: string;
    images: string[];
    condition: string;
    status: string;
    views: number; // Add views
    user: {
        _id: string;
        name: string;
        email: string;
        image?: string;
        phone?: string;
        createdAt: string;
    };
    createdAt: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
        wilaya: string;
        commune: string;
    };
}

const CONDITION_LABELS: { [key: string]: string } = {
    'new': 'Neuf',
    'like-new': 'Comme neuf',
    'good': 'Bon état',
    'fair': 'État moyen',
    'refurbished': 'Reconditionné',
    'for-parts': 'Pour pièces'
};

export default function AdDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [adId, setAdId] = useState<string>('');
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPhone, setShowPhone] = useState(false);
    const [contactingLoading, setContactingLoading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        params.then(({ id }) => {
            setAdId(id);
        });
    }, [params]);

    useEffect(() => {
        if (adId) {
            fetchAd();
            incrementView();
        }
    }, [adId]);

    const fetchAd = async () => {
        try {
            const res = await fetch(`/api/ads/${adId}`);
            if (res.ok) {
                const data = await res.json();
                setAd(data);

                // Update local storage for recently viewed
                const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                if (!viewed.includes(adId)) {
                    const newViewed = [adId, ...viewed].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(newViewed));
                }
            }
        } catch (error) {
            console.error('Failed to fetch ad:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementView = async () => {
        try {
            await fetch(`/api/ads/${adId}/view`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to increment view:', error);
        }
    };

    const handleContactSeller = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (!ad) return;

        setContactingLoading(true);

        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adId: ad._id,
                    sellerId: ad.user._id,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/messages/${data._id}`);
            }
        } catch (error) {
            console.error('Failed to create conversation:', error);
        } finally {
            setContactingLoading(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/ads/${adId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/profile?tab=ads');
            } else {
                const error = await res.json();
                alert(error.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Failed to delete ad:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/ads/${adId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setAd(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Annonce non trouvée</h2>
                    <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const isOwnAd = session?.user?.id === ad.user._id;

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb & Actions */}
                <div className="flex justify-between items-center mb-6">
                    <nav className="text-sm text-gray-500">
                        <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/')}>Accueil</span>
                        <span className="mx-2">/</span>
                        <span className="hover:text-primary cursor-pointer" onClick={() => router.push(`/search?category=${ad.category}`)}>{ad.category}</span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{ad.title}</span>
                    </nav>
                    <div className="flex gap-2">
                        {isOwnAd && (
                            <>
                                <button
                                    onClick={() => handleStatusChange(ad.status === 'sold' ? 'active' : 'sold')}
                                    className={`px-4 py-2 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-medium ${ad.status === 'sold' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                                        }`}
                                >
                                    {ad.status === 'sold' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Disponible
                                        </>
                                    ) : (
                                        <>
                                            <Tag className="w-4 h-4" />
                                            Vendu
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => router.push(`/ads/${adId}/edit`)}
                                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Modifier
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Supprimer
                                </button>
                            </>
                        )}
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-full transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-all">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {ad.status === 'sold' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-xl">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-bold">
                                    Cette annonce est marquée comme vendue.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Gallery & Description */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Gallery */}
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="relative aspect-[4/3] bg-gray-100">
                                {ad.images[selectedImageIndex] ? (
                                    <Image
                                        src={ad.images[selectedImageIndex]}
                                        alt={ad.title}
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Pas d'image
                                    </div>
                                )}
                            </div>
                            {ad.images.length > 1 && (
                                <div className="p-4 flex gap-3 overflow-x-auto">
                                    {ad.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <Image src={img} alt="" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description & Details */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-8">
                                {ad.description}
                            </p>

                            <h3 className="text-lg font-bold text-gray-900 mb-4">Caractéristiques</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-xs text-gray-500">Localisation</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {ad.wilaya}
                                            {ad.location?.commune && ` - ${ad.location.commune}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-xs text-gray-500">État</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {CONDITION_LABELS[ad.condition] || ad.condition}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-xs text-gray-500">Date de publication</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(ad.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                    <Eye className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-xs text-gray-500">Vues</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {ad.views || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Map */}
                        {ad.location && ad.location.latitude && ad.location.longitude && (
                            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Localisation</h3>
                                    <DistanceCalculator
                                        latitude={ad.location.latitude}
                                        longitude={ad.location.longitude}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mb-4">{ad.location.address}</p>
                                <MapPreview
                                    latitude={ad.location.latitude}
                                    longitude={ad.location.longitude}
                                    address={ad.location.address}
                                />
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100">
                            <ReviewSection
                                targetUserId={ad.user._id}
                                adId={ad._id}
                                sellerName={ad.user.name}
                            />
                        </div>
                    </div>

                    {/* Right Column: Price & Seller Info */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{ad.title}</h1>
                            <p className="text-3xl font-extrabold text-primary mb-4">{ad.price.toLocaleString()} DA</p>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Paiement à la livraison recommandé
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <Link href={`/user/${ad.user._id}`} className="flex-shrink-0 group">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-primary transition-colors overflow-hidden relative">
                                        {ad.user.image ? (
                                            <Image src={ad.user.image} alt={ad.user.name} fill className="object-cover" />
                                        ) : (
                                            <User className="w-7 h-7 text-gray-500 group-hover:text-primary" />
                                        )}
                                    </div>
                                </Link>
                                <div>
                                    <Link href={`/user/${ad.user._id}`} className="font-bold text-gray-900 hover:text-primary transition-colors">
                                        {ad.user.name}
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                        Membre depuis {new Date(ad.user.createdAt || Date.now()).getFullYear()}
                                    </p>
                                </div>
                            </div>

                            {!isOwnAd ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleContactSeller}
                                        disabled={contactingLoading}
                                        className="w-full bg-primary text-white py-3.5 px-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        {contactingLoading ? 'Chargement...' : 'Envoyer un message'}
                                    </button>

                                    {ad.user.phone && (
                                        <button
                                            onClick={() => setShowPhone(!showPhone)}
                                            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 px-4 rounded-xl font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                                        >
                                            <Phone className="w-5 h-5" />
                                            {showPhone ? ad.user.phone : 'Afficher le numéro'}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                                    <p className="text-sm font-medium text-blue-800">C'est votre annonce</p>
                                    <button
                                        onClick={() => router.push('/profile')}
                                        className="mt-2 text-xs text-blue-600 hover:underline"
                                    >
                                        Gérer mes annonces
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                            <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                Conseils de sécurité
                            </h4>
                            <ul className="text-sm text-orange-700 space-y-2 list-disc pl-4">
                                <li>Ne payez jamais à l'avance.</li>
                                <li>Rencontrez le vendeur dans un lieu public.</li>
                                <li>Vérifiez l'article avant de l'acheter.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 transition-all disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Suppression...
                                    </>
                                ) : (
                                    'Supprimer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
