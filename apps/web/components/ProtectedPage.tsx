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
    if (!isLoading) {
      if (!isLoggedIn || !user) {
        router.push(fallbackPath);
        return;
      }

      // Check role requirements
      if (requireRole === 'admin' && user.role !== 'admin') {
        router.push('/');
        return;
      }

      if (requireRole === 'moderator' && !['admin', 'moderator'].includes(user.role)) {
        router.push('/');
        return;
      }

      // Check if user is active
      if (!user.is_active) {
        router.push('/login?error=account_inactive');
        return;
      }
    }
  }, [isLoading, isLoggedIn, user, requireRole, fallbackPath, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or authorized
  if (!isLoggedIn || !user || !user.is_active) {
    return null;
  }

  // Check role authorization
  if (requireRole === 'admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
}