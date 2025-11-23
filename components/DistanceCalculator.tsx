'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface DistanceCalculatorProps {
    latitude: number;
    longitude: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function DistanceCalculator({ latitude, longitude }: DistanceCalculatorProps) {
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    const dist = calculateDistance(userLat, userLon, latitude, longitude);
                    setDistance(dist);
                },
                (err) => {
                    console.error("Error getting location", err);
                    setError("Location access denied");
                }
            );
        } else {
            setError("Geolocation not supported");
        }
    }, [latitude, longitude]);

    if (error) {
        return null; // Don't show anything if location is denied or not supported
    }

    if (distance === null) {
        return (
            <div className="flex items-center gap-1 text-sm text-gray-400 animate-pulse">
                <MapPin className="h-4 w-4" />
                <span>Calculating distance...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-sm font-medium text-primary">
            <MapPin className="h-4 w-4" />
            <span>{distance.toFixed(1)} km away</span>
        </div>
    );
}
