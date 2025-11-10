// src/pages/ProtectedRoute.jsx (Recommended Structure)

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useContext(AuthContext);

    // 1. ✅ CRITICAL STEP: Show nothing (or a spinner) while loading is TRUE.
    // This prevents the page from flickering as it decides whether to redirect or show content.
    if (loading) {
        // You can return a simple loading spinner here instead of null
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-orange-500">
            Checking authentication...
        </div>; 
    }

    // 2. 🛑 REDIRECT: If loading is false, and there is no user, redirect to login.
    if (!currentUser) {
        // Use the 'replace' prop to prevent the user from going back to the protected page via history.
        return <Navigate to="/login" replace />;
    }

    // 3. ✨ SUCCESS: If loading is false AND a user exists, show the requested page.
    // The 'children' prop is the component you wrapped (like <Profile /> or <EditEvent />).
    return children;
};

export default ProtectedRoute;