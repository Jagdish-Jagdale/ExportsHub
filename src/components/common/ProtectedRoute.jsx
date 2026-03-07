import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from './Loader';

export function ProtectedRoute({ children, verified = false }) {
    const { user, loading, isVerified } = useAuth();

    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;
    if (verified && !isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
                    <p className="text-gray-600 mb-4">Please verify your email address to access this feature. Check your inbox for the verification link.</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        I've Verified My Email
                    </button>
                </div>
            </div>
        );
    }
    return children;
}

export function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}
