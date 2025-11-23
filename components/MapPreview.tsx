'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

interface MapPreviewProps {
    latitude: number;
    longitude: number;
    address?: string;
}

export default function MapPreview({ latitude, longitude, address }: MapPreviewProps) {
    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
            <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: '100%', width: '100%' }} dragging={false} scrollWheelZoom={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[latitude, longitude]}>
                    {address && <Popup>{address}</Popup>}
                </Marker>
            </MapContainer>
        </div>
    );
}
