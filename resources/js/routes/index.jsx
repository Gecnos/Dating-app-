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
import AuthCallback from '../pages/Auth/AuthCallback';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import EmailVerified from '../pages/Auth/EmailVerified';

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

import Explorer from '../pages/Explorer';
import MatchSuccess from '../pages/MatchSuccess';
import Verify from '../pages/Verify';
import AdminReports from '../pages/AdminReports';
import AdminDashboard from '../pages/AdminDashboard';
import AdminBroadcast from '../pages/AdminBroadcast';
import AdminActivityLog from '../pages/AdminActivityLog';


import SplashScreen from '../components/ui/SplashScreen';

// Mirrors LoginController::getOnboardingStep() so a user who abandoned
// onboarding mid-way can't reach the rest of the app with an incomplete
// profile (e.g. no intention_id or avatar) by navigating there directly.
const getOnboardingStep = (user) => {
    if (!user.gender || !user.date_of_birth) return 'basic';
    if (!user.intention_id) return 'intentions';
    if (!user.interests || user.interests.length < 3) return 'interests';
    if (!user.avatar) return 'photos';
    return 'completed';
};

const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <SplashScreen />;
    if (!user) return <Navigate to="/login" replace />;

    const step = getOnboardingStep(user);
    if (step !== 'completed') {
        return <Navigate to={`/onboarding/${step}`} replace />;
    }

    return children;
};

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />

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

                {/* Admin — being logged in is necessary but not sufficient; the
                    backend enforces is_admin on every /api/admin/* call, this
                    page just 403s cleanly for non-admins on load. */}
                <Route path="/admin/verify" element={<Verify />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/broadcast" element={<AdminBroadcast />} />
                <Route path="/admin/activity-log" element={<AdminActivityLog />} />

                <Route path="*" element={<Navigate to="/discovery" replace />} />
            </Route>
        </Routes>
    );
}
