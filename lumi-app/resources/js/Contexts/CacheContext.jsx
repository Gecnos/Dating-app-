import React, { createContext, useContext, useState, useCallback } from 'react';

const CacheContext = createContext();

export const useCache = () => useContext(CacheContext);

export const CacheProvider = ({ children }) => {
    const [cache, setCache] = useState({});

    // Retrieve data if it exists and isn't expired
    const getCachedData = useCallback((key) => {
        const item = cache[key];
        if (!item) return null;

        const now = Date.now();
        if (now > item.expiry) {
            // Remove expired item
            const newCache = { ...cache };
            delete newCache[key];
            setCache(newCache);
            return null;
        }

        return item.data;
    }, [cache]);

    // Save data with an expiry time (default 5 mins)
    const setCachedData = useCallback((key, data, ttlInSeconds = 300) => {
        const expiry = Date.now() + (ttlInSeconds * 1000);
        setCache(prev => ({
            ...prev,
            [key]: { data, expiry }
        }));
    }, []);

    // Clear specific or all cache
    const clearCache = useCallback((key = null) => {
        if (key) {
            setCache(prev => {
                const newCache = { ...prev };
                delete newCache[key];
                return newCache;
            });
        } else {
            setCache({});
        }
    }, []);

    return (
        <CacheContext.Provider value={{ getCachedData, setCachedData, clearCache }}>
            {children}
        </CacheContext.Provider>
    );
};
