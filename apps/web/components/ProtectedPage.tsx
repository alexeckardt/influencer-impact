'use client';

import { useAuth } from '@/lib/auth-context';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedPageProps {
  children: ReactNode;
  requireRole?: 'user' | 'moderator' | 'admin';
  fallbackPath?: string;
}

export function ProtectedPage({
  children,
  requireRole = 'user',
  fallbackPath = '/login'
}: ProtectedPageProps) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run checks when loading is complete AND we have stable auth state
    if (!isLoading) {
      console.log('ProtectedPage: Auth loading complete', { isLoggedIn, user: !!user, role: user?.role });

      // Don't redirect if we have a user - let the render logic handle authorization
      if (!isLoggedIn || !user) {
        console.log('ProtectedPage: Not logged in, redirecting to', fallbackPath);
        router.push(fallbackPath);
      }
    }
  }, [isLoading, isLoggedIn, user, fallbackPath, router]);

  // Show loading state while checking auth
  if (isLoading) {
    console.log('ProtectedPage: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (redirect should happen in useEffect)
  if (!user) {
    console.log('ProtectedPage: No user, showing loading while redirect processes');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Check if user is inactive
  if (!user.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h1>
          <p className="text-gray-600">Your account is not active. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (requireRole === 'admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: admin, Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  if (requireRole === 'moderator' && !['admin', 'moderator'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: moderator/admin, Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  console.log('ProtectedPage: All checks passed, rendering children');
  return <div className="bg-gray-50 min-h-screen">
    {children}
  </div>;
}