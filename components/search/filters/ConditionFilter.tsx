'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useRouter } from '@/i18n/routing';

const CONDITIONS = [
    { id: 'new', label: 'Neuf' },
    { id: 'like-new', label: 'Comme neuf' },
    { id: 'good', label: 'Bon état' },
    { id: 'fair', label: 'État moyen' },
    { id: 'refurbished', label: 'Reconditionné' },
    { id: 'for-parts', label: 'Pour pièces' },
];

export default function ConditionFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCondition = searchParams.get('condition');

    const handleConditionChange = useCallback((condition: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (condition === currentCondition) {
            params.delete('condition');
        } else {
            params.set('condition', condition);
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    }, [searchParams, currentCondition, router]);

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">État</h3>
            <div className="space-y-2">
                {CONDITIONS.map((cond) => (
                    <label key={cond.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentCondition === cond.id
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300 group-hover:border-primary'
                            }`}>
                            {currentCondition === cond.id && (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={currentCondition === cond.id}
                            onChange={() => handleConditionChange(cond.id)}
                        />
                        <span className={`text-sm ${currentCondition === cond.id ? 'text-gray-900 font-medium' : 'text-gray-600'
                            }`}>
                            {cond.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
