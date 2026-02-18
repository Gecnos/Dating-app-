import React, { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function LocationTracker() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const updateLocation = (position) => {
            const { latitude, longitude } = position.coords;
            
            axios.post('/api/user/location', {
                latitude,
                longitude
            }).catch(error => {
                console.error("Failed to sync location:", error);
            });
        };

        const handleError = (error) => {
            console.warn("Geolocation error:", error.message);
        };

        if ("geolocation" in navigator) {
            // Request once on mount
            navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });

            // Watch position for updates
            const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [user]);

    return null; // This component doesn't render anything
}
