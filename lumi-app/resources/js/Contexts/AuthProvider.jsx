import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState(true);
    const [bootstrapData, setBootstrapData] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get('/bootstrap');
                    setUser(response.data.user);
                    setBootstrapData(response.data); 
                    // response.data contains: user, settings, notifications, app_config
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('auth_token', newToken);
        // We might want to fetch bootstrap here too if login doesn't return everything? 
        // Login usually returns struct { token, user... }
        // We can trigger a fetch or just let the redirect to dashboard trigger things.
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setBootstrapData(null);
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading, bootstrapData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
