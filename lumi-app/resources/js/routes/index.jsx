import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthProvider';

// Temporary placeholders or lazy loaded components
// We will refactor these pages in Phase 3
import Discovery from '../pages/Discovery';
import ChatList from '../pages/ChatList';
import Chat from '../pages/Chat';
import Profile from '../pages/Profile';
import Likes from '../pages/Likes';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Onboarding
import BasicInformation from '../pages/Onboarding/BasicInformation';
import MatchingIntentions from '../pages/Onboarding/MatchingIntentions';
import InterestsSelection from '../pages/Onboarding/InterestsSelection';
import PhotoGallery from '../pages/Onboarding/PhotoGallery';

// Profile & Features
import EditProfile from '../pages/EditProfile';
import ProfileDetails from '../pages/ProfileDetails';
import PhotoManagement from '../pages/PhotoManagement';

// Settings & Static
import Settings from '../pages/Settings';
import Notifications from '../pages/Notifications';
import BlockedUsers from '../pages/BlockedUsers';
import Help from '../pages/Help';
import Terms from '../pages/Legal/Terms';
import Privacy from '../pages/Legal/Privacy';
import CreditsVIP from '../pages/CreditsVIP';

import Explorer from '../pages/Explorer';
import MatchSuccess from '../pages/MatchSuccess';


import SplashScreen from '../components/ui/SplashScreen';

const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <SplashScreen />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Onboarding Routes (Protected?) - Usually yes */}
            <Route path="/onboarding/basic" element={<ProtectedRoute><BasicInformation /></ProtectedRoute>} />
            <Route path="/onboarding/intentions" element={<ProtectedRoute><MatchingIntentions /></ProtectedRoute>} />
            <Route path="/onboarding/interests" element={<ProtectedRoute><InterestsSelection /></ProtectedRoute>} />
            <Route path="/onboarding/photos" element={<ProtectedRoute><PhotoGallery /></ProtectedRoute>} />
            {/* Fallback for numbered steps if backend sends numbers */}
            <Route path="/onboarding/1" element={<Navigate to="/onboarding/basic" replace />} />
            <Route path="/onboarding/2" element={<Navigate to="/onboarding/intentions" replace />} />
            <Route path="/onboarding/3" element={<Navigate to="/onboarding/interests" replace />} />
            <Route path="/onboarding/4" element={<Navigate to="/onboarding/photos" replace />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/match/success/:id" element={<MatchSuccess />} />
                <Route path="/explorer" element={<Explorer />} />
                <Route path="/chat" element={<ChatList />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="/likes" element={<Likes />} />

                {/* Profile & Features */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/:id" element={<ProfileDetails />} />
                <Route path="/photos/manage" element={<PhotoManagement />} />

                {/* Settings & Static */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/notifications" element={<Notifications />} />
                <Route path="/settings/blocked" element={<BlockedUsers />} />
                <Route path="/help" element={<Help />} />
                <Route path="/legal/terms" element={<Terms />} />
                <Route path="/legal/privacy" element={<Privacy />} />
                <Route path="/credits" element={<CreditsVIP />} />

                <Route path="*" element={<Navigate to="/discovery" replace />} />
            </Route>
        </Routes>
    );
}
