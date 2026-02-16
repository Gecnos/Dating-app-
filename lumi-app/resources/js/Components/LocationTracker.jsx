import React, { useEffect } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

const LocationTracker = () => {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth?.user) return;

        const updateLocation = (position) => {
            const { latitude, longitude } = position.coords;

            axios.post(route('user.location'), {
                latitude,
                longitude
            }).catch(err => {
                console.error('Error updating location:', err);
            });
        };

        const handleError = (error) => {
            console.warn('Geolocation error:', error.message);
        };

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        }
    }, [auth?.user?.id]);

    return null; // Silent component
};

export default LocationTracker;
