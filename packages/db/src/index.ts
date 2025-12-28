// Database exports
export * from './schema';

// Supabase Database type definition
// This is a simplified type that matches what Supabase expects
export type Database = {
  public: {
    Tables: {
      prospect_users: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          password: string;
          company: string | null;
          job_title: string | null;
          years_experience: string | null;
          linkedin_url: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          password: string;
          company?: string | null;
          job_title?: string | null;
          years_experience?: string | null;
          linkedin_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          password?: string;
          company?: string | null;
          job_title?: string | null;
          years_experience?: string | null;
          linkedin_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
      };
      users: {
        Row: {
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
        Insert: {
          id: string;
          prospect_user_id?: string | null;
          username: string;
          email: string;
          first_name: string;
          last_name: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          job_title?: string | null;
          years_experience?: string | null;
          linkedin_url?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          prospect_user_id?: string | null;
          username?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          job_title?: string | null;
          years_experience?: string | null;
          linkedin_url?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
        };
      };
      influencers: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          primary_niche: string;
          verified: boolean;
          profile_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          primary_niche: string;
          verified?: boolean;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          primary_niche?: string;
          verified?: boolean;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      influencer_handles: {
        Row: {
          id: string;
          influencer_id: string;
          platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube';
          username: string;
          url: string;
          follower_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          influencer_id: string;
          platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube';
          username: string;
          url: string;
          follower_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          influencer_id?: string;
          platform?: 'twitter' | 'instagram' | 'tiktok' | 'youtube';
          username?: string;
          url?: string;
          follower_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          influencer_id: string;
          user_id: string;
          title: string;
          content: string;
          rating: number;
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          influencer_id: string;
          user_id: string;
          title: string;
          content: string;
          rating: number;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          influencer_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          rating?: number;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
