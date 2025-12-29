'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from './supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  prospect_user_id: string | null;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  years_experience: string | null;
  linkedin_url: string | null;
  role: 'user' | 'moderator' | 'admin';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
};

export interface User extends UserProfile {
  supabaseUser: SupabaseUser;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  // Check initial auth state and set up auth listener
  useEffect(() => {
    const getInitialUser = async () => {
      try {
        console.log('AuthProvider: Checking initial auth state');
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        console.log('AuthProvider: Initial supabase user:', supabaseUser);

        if (supabaseUser) {
          console.log('AuthProvider: Loading user profile for', supabaseUser.id);
          await loadUserProfile(supabaseUser);
        } else {
          console.log('AuthProvider: No authenticated user found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
        setIsLoading(false);
      }
      // Don't set isLoading to false here - let loadUserProfile handle it
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change event:', event, 'Session exists:', !!session);
        if (event === 'SIGNED_IN') {
          console.log('✅ SIGNED_IN event, getting authenticated user');
          setIsLoading(true); // Set loading while we load the profile
          
          // Use getUser() instead of session.user for security
          const { data: { user: authenticatedUser }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('❌ Failed to get authenticated user:', error);
            setIsLoading(false);
            return;
          }
          
          if (authenticatedUser) {
            console.log('✅ Got authenticated user:', authenticatedUser.id);
            await loadUserProfile(authenticatedUser);
          } else {
            console.log('⚠️ No authenticated user found after SIGNED_IN event');
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 SIGNED_OUT event, clearing user state');
          setUser(null);
          setIsLoggedIn(false);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed, maintaining current state');
          // Don't change loading state for token refresh
        } else {
          console.log('🔄 Other auth event:', event);
          if (!session) {
            setIsLoading(false);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('🔍 loadUserProfile started for user:', supabaseUser.id);
    try {
      console.log('🔍 Querying users table...');
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error('❌ Error loading user profile:', error);
        
        // If it's an RLS policy error, sign out and set loading to false
        if (error.message.includes('infinite recursion') || error.message.includes('policy')) {
          console.warn('⚠️ RLS policy error detected, signing out');
          setUser(null);
          setIsLoggedIn(false);
          setIsLoading(false);
          await supabase.auth.signOut();
          return;
        }
        
        // User might not be approved yet
        console.warn('⚠️ User profile not found or error, signing out');
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        await supabase.auth.signOut();
        return;
      }

      console.log('✅ User profile loaded successfully:', userProfile);
      console.log('🔍 User role:', userProfile.role);
      console.log('🔍 User active status:', userProfile.is_active);
    
      if (!userProfile.is_active) {
        console.error('❌ User account is inactive');
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
        await supabase.auth.signOut();
        return;
      }

      const fullUser: User = {
        ...userProfile,
        supabaseUser,
      };

      console.log('✅ Setting authenticated user with role:', fullUser.role);
      setUser(fullUser);
      setIsLoggedIn(true);
      setIsLoading(false);
      console.log('✅ Auth state updated: isLoggedIn=true, isLoading=false');
    } catch (error) {
      console.error('❌ Unexpected error in loadUserProfile:', error);
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      await supabase.auth.signOut();
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {


    setIsLoading(true);

    try {
      // First, clear local state immediately
      setUser(null);
      setIsLoggedIn(false);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Even if Supabase sign out fails, we want to clear local state
      }

      // Switch Page
      window.location.href = '/login';
      
      // Force clear any remaining session data
      if (typeof window !== 'undefined') {
        // Clear any localStorage data that might persist
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1] + '-auth-token');
      }
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if there's an error
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        isLoading, 
        user, 
        signIn, 
        signOut, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
