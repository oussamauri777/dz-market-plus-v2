'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { Loader2, Camera, X, MapPin, Tag, Type, FileText, DollarSign, Layers } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { CATEGORIES } from '@/lib/constants/categories';
import { getWilayas, getCommunesByWilayaId } from 'algeria-locations';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>
});

const CONDITIONS = [
    { value: 'new', label: 'Neuf' },
    { value: 'like-new', label: 'Comme neuf' },
    { value: 'good', label: 'Bon état' },
    { value: 'fair', label: 'État moyen' },
    { value: 'refurbished', label: 'Reconditionné' },
    { value: 'for-parts', label: 'Pour pièces' }
];

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [adId, setAdId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        wilaya: '',
        commune: '',
        condition: 'good',
        images: [] as string[],
        location: null as any
    });

    const wilayas = useMemo(() => getWilayas(), []);
    const communes = useMemo(() => {
        if (!formData.wilaya) return [];
        const selectedWilaya = wilayas.find(w => w.name === formData.wilaya);
        if (!selectedWilaya) return [];
        return getCommunesByWilayaId(selectedWilaya.id) || [];
    }, [formData.wilaya, wilayas]);

    const selectedCategory = CATEGORIES.find(c => c.label === formData.category);

    useEffect(() => {
        params.then(({ id }) => {
            setAdId(id);
        });
    }, [params]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (adId && session) {
            fetchAd();
        }
    }, [adId, session]);

    const fetchAd = async () => {
        try {
            const res = await fetch(`/api/ads/${adId}`);
            if (res.ok) {
                const ad = await res.json();

                // Check if user owns this ad
                if (ad.user._id !== session?.user?.id) {
                    router.push(`/ads/${adId}`);
                    return;
                }

                setFormData({
                    title: ad.title,
                    description: ad.description,
                    price: ad.price.toString(),
                    category: ad.category,
                    subcategory: ad.subcategory || '',
                    wilaya: ad.wilaya,
                    commune: ad.location?.commune || '',
                    condition: ad.condition || 'good',
                    images: ad.images || [],
                    location: ad.location || null
                });
            } else {
                setError('Annonce non trouvée');
            }
        } catch (error) {
            setError('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                location: {
                    ...formData.location,
                    wilaya: formData.wilaya,
                    commune: formData.commune
                }
            };

            const res = await fetch(`/api/ads/${adId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push(`/ads/${adId}`);
            } else {
                const data = await res.json();
                setError(data.error || 'Erreur lors de la modification');
            }
        } catch (error) {
            setError('Erreur lors de la modification');
        } finally {
            setSubmitting(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-primary px-8 py-6">
                        <h1 className="text-2xl font-bold text-white">Modifier l'annonce</h1>
                        <p className="text-primary-100 mt-2">Mettez à jour les informations de votre annonce</p>
                    </div>

                    {error && (
                        <div className="m-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Photos Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-900">Photos</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <CldUploadWidget
                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                    options={{
                                        maxFiles: 10,
                                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                                        maxFileSize: 5000000, // 5MB
                                        maxImageWidth: 2000, // Resize large images
                                        sources: ['local', 'camera'],
                                    }}
                                    onSuccess={(result: any) => {
                                        if (formData.images.length >= 10) return;
                                        setFormData((prev) => ({
                                            ...prev,
                                            images: [...prev.images, result.info.secure_url],
                                        }));
                                    }}
                                >
                                    {({ open }) => {
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (formData.images.length < 10) open();
                                                }}
                                                disabled={formData.images.length >= 10}
                                                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all group ${formData.images.length >= 10
                                                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                                                    : 'border-gray-300 text-gray-400 hover:border-primary hover:text-primary hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">
                                                    {formData.images.length >= 10 ? 'Max atteint' : 'Ajouter'}
                                                </span>
                                            </button>
                                        );
                                    }}
                                </CldUploadWidget>

                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-200">
                                        <Image src={img} alt="Uploaded" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500">Ajoutez jusqu'à 10 photos. La première photo sera l'image principale.</p>
                        </div>

                        <div className="border-t border-gray-100 pt-8 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Titre de l'annonce</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: iPhone 13 Pro Max 256GB"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Category & Subcategory */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Catégorie</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            required
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.label}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Sous-catégorie</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Layers className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            required
                                            disabled={!formData.category}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                            value={formData.subcategory}
                                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {selectedCategory?.subcategories.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Wilaya, Commune & Condition */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Wilaya</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            required
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white"
                                            value={formData.wilaya}
                                            onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {wilayas.map((w: any) => (
                                                <option key={w.code} value={w.name}>
                                                    {w.code} - {w.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Commune</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            required
                                            disabled={!formData.wilaya}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                            value={formData.commune}
                                            onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {communes.map((c: any) => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">État</label>
                                    <select
                                        required
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white"
                                    >
                                        {CONDITIONS.map((cond) => (
                                            <option key={cond.value} value={cond.value}>{cond.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="Décrivez votre article en détail..."
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Prix (DZD)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Location Picker */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Localisation sur la carte</label>
                                <LocationPicker
                                    onLocationSelect={(location) => setFormData({ ...formData, location })}
                                    initialLocation={formData.location}
                                />
                                <p className="text-xs text-gray-500 mt-2">Cliquez sur la carte pour définir votre localisation exacte (optionnel)</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form >
                </div >
            </div >
        </div >
    );
}
