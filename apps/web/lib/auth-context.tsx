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
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          await loadUserProfile(supabaseUser);
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoggedIn(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // User might not be approved yet
        await supabase.auth.signOut();
        return;
      }

      if (!userProfile.is_active) {
        console.error('User account is inactive');
        await supabase.auth.signOut();
        return;
      }

      const fullUser: User = {
        ...userProfile,
        supabaseUser,
      };

      setUser(fullUser);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
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
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
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
