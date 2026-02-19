import React, { useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function LocationTracker() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const sendLocation = (latitude, longitude) => {
            // Check if we already sent this location recently (simple session storage optimization)
            const lastLoc = sessionStorage.getItem('last_known_location');
            if (lastLoc) {
                const { lat, lng, time } = JSON.parse(lastLoc);
                const distance = Math.sqrt(Math.pow(lat - latitude, 2) + Math.pow(lng - longitude, 2));
                // If moved less than ~100m (approx 0.001 deg) and updated < 5 mins ago, skip
                if (distance < 0.001 && (Date.now() - time) < 300000) return;
            }

            axios.post('/user/location', { latitude, longitude })
                .then(() => {
                    sessionStorage.setItem('last_known_location', JSON.stringify({
                        lat: latitude, 
                        lng: longitude, 
                        time: Date.now() 
                    }));
                })
                .catch(err => console.error("Location sync failed", err));
        };

        const update = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
                    (err) => console.warn("Geo error:", err.message),
                    { enableHighAccuracy: false, timeout: 5000 }
                );
            }
        };

        // Update on mount
        update();

        // And every 5 minutes
        const interval = setInterval(update, 300000); 

        return () => clearInterval(interval);
    }, [user?.id]); // Only re-run if user ID changes, not the whole user object

    return null;
}
