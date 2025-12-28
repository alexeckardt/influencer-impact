'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // If User is admin, navigate to admin dashboard.
  // If user is NOT admin, will kick them out anyways.
  const handleAdminClick = () => {
    setIsOpen(false);
    router.push('/admin');
  }

  const handleProfileClick = () => {
    // For now, we'll just close the dropdown
    // In the future, this can navigate to a profile page
    setIsOpen(false);
    // router.push('/profile');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Profile Picture */}
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`${user.first_name || user.username}'s avatar`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default avatar on error
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <User className={`w-5 h-5 text-gray-600 ${user.avatar_url ? 'hidden' : ''}`} />
        </div>

        {/* User Name */}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.first_name || user.username}
        </span>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>

            {user.role === 'admin' && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white bg-yellow-500 rounded-full">
                Admin
              </span>
            )}
          </div>

          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4" />
            Your Profile
          </button>

          {
            user.role === 'admin' && (
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Crown className="w-4 h-4 text-yellow-500" />
                Admin Dashboard
              </button>
            )
          }

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}