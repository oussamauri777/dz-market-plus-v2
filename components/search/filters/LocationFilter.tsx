'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { getWilayas, getCommunesByWilayaId } from 'algeria-locations';

export default function LocationFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentWilaya = searchParams.get('wilaya');
    const currentCommune = searchParams.get('commune');

    const wilayas = useMemo(() => getWilayas(), []);
    const communes = useMemo(() => {
        if (!currentWilaya) return [];
        const selectedWilaya = wilayas.find(w => w.name === currentWilaya);
        if (!selectedWilaya) return [];
        return getCommunesByWilayaId(selectedWilaya.id) || [];
    }, [currentWilaya, wilayas]);

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset commune if wilaya changes
        if (key === 'wilaya') {
            params.delete('commune');
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
                        {wilayas.map((w) => (
                            <option key={w.code} value={w.name}>
                                {w.code} - {w.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Commune</label>
                    <select
                        value={currentCommune || ''}
                        onChange={(e) => updateParam('commune', e.target.value)}
                        disabled={!currentWilaya}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    >
                        <option value="">Toutes les communes</option>
                        {communes.map((c) => (
                            <option key={c.id || c.name} value={c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
