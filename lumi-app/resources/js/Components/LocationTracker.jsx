import React, { useEffect } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

const LocationTracker = () => {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth?.user) return;

        const performUpdate = () => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        axios.post(route('user.location'), {
                            latitude,
                            longitude
                        }).catch(err => console.warn('Location sync failed:', err));
                    },
                    (error) => console.warn('Geolocation error:', error.message),
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        };

        // Update immediately
        performUpdate();

        // Then every 30 minutes
        const interval = setInterval(performUpdate, 30 * 60 * 1000);

        return () => clearInterval(interval);
    }, [auth?.user?.id]);

    return null; // Silent component
};

export default LocationTracker;
