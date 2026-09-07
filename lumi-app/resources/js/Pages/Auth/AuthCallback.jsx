import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

// Landing page for the Google OAuth redirect. The backend
// (GoogleController::handleGoogleCallback) sends the browser here with
// ?token=...&user_id=...&new_user=... after completing the OAuth exchange.
export default function AuthCallback() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [tokenApplied, setTokenApplied] = useState(false);

    useEffect(() => {
        const token = params.get('token');
        const error = params.get('error');

        if (error || !token) {
            navigate('/login?error=google_auth_failed', { replace: true });
            return;
        }

        // Full user profile isn't in the redirect query string; AuthProvider
        // fetches it from /bootstrap as soon as the token is set.
        login(token, null);
        setTokenApplied(true);
    }, []);

    useEffect(() => {
        if (!tokenApplied || !user) return;

        if (!user.gender || !user.date_of_birth) {
            navigate('/onboarding/basic', { replace: true });
        } else if (!user.intention_id) {
            navigate('/onboarding/intentions', { replace: true });
        } else if (!user.interests || user.interests.length < 3) {
            navigate('/onboarding/interests', { replace: true });
        } else if (!user.avatar) {
            navigate('/onboarding/photos', { replace: true });
        } else {
            navigate('/discovery', { replace: true });
        }
    }, [tokenApplied, user]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#101322] flex items-center justify-center">
            <div className="size-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
