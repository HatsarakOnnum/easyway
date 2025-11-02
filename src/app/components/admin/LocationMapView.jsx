"use client";
import React, { useRef, useEffect } from 'react';

export default function LocationMapView({ location, onBack }) {
    const mapRef = useRef(null);
    const isLoaded = typeof window !== 'undefined' && window.google && window.google.maps; // Check if google maps is loaded

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: location.lat, lng: location.lng }, zoom: 17, disableDefaultUI: true,
            });
            new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng }, map: map, title: location.name,
            });
        }
    }, [isLoaded, location]); // Dependency array

    return (
        <div className="dark:text-gray-200">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Viewing: {location.name}</h2>
                <button onClick={onBack} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Back</button>
            </div>
            <div ref={mapRef} className="w-full h-[600px] rounded-lg shadow-md bg-gray-300 dark:bg-gray-700">
                {!isLoaded && <div className="flex items-center justify-center h-full">Loading map...</div>}
            </div>
        </div>
    );
};