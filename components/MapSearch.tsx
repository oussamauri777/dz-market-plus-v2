'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import Link from 'next/link';

interface Ad {
    _id: string;
    title: string;
    price: number;
    images: string[];
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
}

interface MapSearchProps {
    ads: Ad[];
}

export default function MapSearch({ ads }: MapSearchProps) {
    const adsWithLocation = ads.filter(ad => ad.location && ad.location.latitude && ad.location.longitude);

    if (adsWithLocation.length === 0) {
        return null;
    }

    // Calculate center based on ads or default to Algiers
    const center: [number, number] = adsWithLocation.length > 0
        ? [adsWithLocation[0].location!.latitude, adsWithLocation[0].location!.longitude]
        : [36.752887, 3.042048];

    return (
        <div className="h-[calc(100vh-140px)] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0 sticky top-24">
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {adsWithLocation.map((ad) => (
                    <Marker key={ad._id} position={[ad.location!.latitude, ad.location!.longitude]}>
                        <Popup>
                            <div className="w-48">
                                <Link href={`/ads/${ad._id}`} className="block group">
                                    <div className="aspect-video relative overflow-hidden rounded-md mb-2 bg-gray-100">
                                        {ad.images[0] && (
                                            <img
                                                src={ad.images[0]}
                                                alt={ad.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm truncate mb-1 group-hover:text-primary transition-colors">{ad.title}</h3>
                                    <p className="font-bold text-primary">{ad.price.toLocaleString()} DA</p>
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
