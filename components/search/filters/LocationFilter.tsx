'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useRouter } from '@/i18n/routing';

const WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran'
].sort();

export default function LocationFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentWilaya = searchParams.get('wilaya');
    const currentCommune = searchParams.get('commune');

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    }, [searchParams, router]);

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Localisation</h3>
            <div className="space-y-3">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Wilaya</label>
                    <select
                        value={currentWilaya || ''}
                        onChange={(e) => updateParam('wilaya', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Toutes les wilayas</option>
                        {WILAYAS.map((w) => (
                            <option key={w} value={w}>{w}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Commune</label>
                    <input
                        type="text"
                        placeholder="Commune..."
                        value={currentCommune || ''}
                        onChange={(e) => updateParam('commune', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
