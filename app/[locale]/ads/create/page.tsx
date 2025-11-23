'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { CldUploadWidget } from 'next-cloudinary';
import { Camera, MapPin, Tag, Type, FileText, DollarSign, X, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>
});

const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
    "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const CATEGORIES = [
    "Voitures", "Immobilier", "Téléphones & Électronique", "Multimédia", "Maison & Jardin",
    "Mode & Beauté", "Jobs", "Services", "Animaux", "Sport & Loisirs"
];

export default function CreateAdPage() {
    const t = useTranslations('Common');
    const router = useRouter();
    const [data, setData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        wilaya: '',
        images: [] as string[],
        location: null as any,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/ads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                router.push('/profile');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-primary px-8 py-6">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <UploadCloud className="w-8 h-8" />
                            Déposer une annonce
                        </h1>
                        <p className="text-primary-100 mt-2">Remplissez les détails ci-dessous pour publier votre annonce.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Photos Section */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-900">Photos</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <CldUploadWidget
                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                    onSuccess={(result: any) => {
                                        setData((prev) => ({
                                            ...prev,
                                            images: [...prev.images, result.info.secure_url],
                                        }));
                                    }}
                                >
                                    {({ open }) => {
                                        return (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-gray-50 transition-all group"
                                            >
                                                <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Ajouter</span>
                                            </button>
                                        );
                                    }}
                                </CldUploadWidget>

                                {data.images.map((img, index) => (
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
                                        placeholder="Ex: iPhone 13 Pro Max 256Go"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400"
                                        value={data.title}
                                        onChange={(e) => setData({ ...data, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Category & Wilaya */}
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
                                            value={data.category}
                                            onChange={(e) => setData({ ...data, category: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Wilaya</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            required
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white"
                                            value={data.wilaya}
                                            onChange={(e) => setData({ ...data, wilaya: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            {WILAYAS.map(w => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Prix (DA)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400"
                                        value={data.price}
                                        onChange={(e) => setData({ ...data, price: e.target.value })}
                                    />
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
                                        placeholder="Décrivez votre produit en détail..."
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 resize-none"
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Localisation</label>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <LocationPicker
                                    onLocationSelect={(loc) => {
                                        setData(prev => ({ ...prev, location: loc, wilaya: loc.wilaya || prev.wilaya }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Publication en cours...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-6 h-6" />
                                        Publier l'annonce
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
