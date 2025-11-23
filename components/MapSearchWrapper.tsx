'use client';

import dynamic from 'next/dynamic';

const MapSearch = dynamic(() => import('./MapSearch'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function MapSearchWrapper({ ads }: { ads: any[] }) {
    return <MapSearch ads={ads} />;
}
