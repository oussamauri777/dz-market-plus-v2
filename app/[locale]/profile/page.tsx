'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import UserReviews from '@/components/profile/UserReviews';
import Image from 'next/image';
import { Camera, MapPin, Phone, User, Save, Loader2 } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';

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

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const t = useTranslations('Navigation');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phone: '',
        wilaya: '',
        image: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetchUserData();
        }
    }, [session]);

    const fetchUserData = async () => {
        try {
            const res = await fetch(`/api/users/${session?.user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.user.name || '',
                    bio: data.user.bio || '',
                    phone: data.user.phone || '',
                    wilaya: data.user.wilaya || '',
                    image: data.user.image || '',
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: updatedUser.name,
                        image: updatedUser.image,
                    }
                });
                router.refresh();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="bg-primary px-8 py-6">
                        <h1 className="text-2xl font-bold text-white">Mon Profil</h1>
                        <p className="text-primary-100 mt-2">Gérez vos informations personnelles</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                {formData.image ? (
                                    <Image
                                        src={formData.image}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <CldUploadWidget
                                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                onSuccess={(result: any) => {
                                    setFormData(prev => ({ ...prev, image: result.info.secure_url }));
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        type="button"
                                        onClick={() => open()}
                                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Changer la photo
                                    </button>
                                )}
                            </CldUploadWidget>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Nom complet</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Téléphone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="05 XX XX XX XX"
                                    />
                                </div>
                            </div>

                            {/* Wilaya */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Wilaya</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white"
                                        value={formData.wilaya}
                                        onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                                    >
                                        <option value="">Sélectionner votre wilaya</option>
                                        {WILAYAS.map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Email (Read Only) */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    value={session.user?.email || ''}
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Bio</label>
                            <textarea
                                rows={4}
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="Parlez-nous un peu de vous..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Enregistrer les modifications
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Reviews Section */}
                {session.user?.id && <UserReviews userId={session.user.id} />}
            </div>
        </div>
    );
}
