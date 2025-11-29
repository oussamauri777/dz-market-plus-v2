'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface Location {
    address: string;
    latitude: number;
    longitude: number;
    wilaya: string;
    commune: string;
}

interface LocationPickerProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
}

function LocationMarker({ position, setPosition, onLocationFound }: any) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationFound(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

// Component to update map view when center changes
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center && typeof center[0] === 'number' && typeof center[1] === 'number') {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const [position, setPosition] = useState<any>(
        initialLocation && initialLocation.latitude && initialLocation.longitude
            ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
            : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([36.752887, 3.042048]); // Default to Algiers

    useEffect(() => {
        if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
            setMapCenter([initialLocation.latitude, initialLocation.longitude]);
        } else {
            // Try to get user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMapCenter([latitude, longitude]);
                });
            }
        }
    }, [initialLocation]);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Algeria')}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectResult = async (result: any) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const newPos = { lat, lng: lon };
        setPosition(newPos);
        setMapCenter([lat, lon]);
        setSearchResults([]);
        setSearchQuery(result.display_name);

        await fetchLocationDetails(lat, lon);
    };

    const fetchLocationDetails = async (lat: number, lon: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();

            const address = data.display_name;
            const addressParts = data.address;
            const wilaya = addressParts.state || addressParts.province || addressParts.region || '';
            const commune = addressParts.city || addressParts.town || addressParts.village || addressParts.county || '';

            const locationData: Location = {
                address,
                latitude: lat,
                longitude: lon,
                wilaya,
                commune
            };

            onLocationSelect(locationData);
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for a city or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
                            >
                                <MapPin className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                                <span className="text-sm text-gray-700 truncate">{result.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapUpdater center={mapCenter} />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationFound={fetchLocationDetails}
                    />
                </MapContainer>
            </div>

            {position && typeof position.lat === 'number' && typeof position.lng === 'number' && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
                </div>
            )}
        </div>
    );
}
