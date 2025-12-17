/**
 * Database helpers for common operations
 * These utilities abstract Supabase queries for type safety
 */

import { createClient } from '@supabase/supabase-js';
import type { Influencer, Review, ReviewLabel } from '@influencer-platform/shared';

/**
 * Initialize Supabase client with service role key (for backend use only)
 */
export function initSupabaseAdmin(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey);
}

/**
 * Fetch influencer by ID with their handles and stats
 */
export async function getInfluencerWithStats(
  supabase: ReturnType<typeof initSupabaseAdmin>,
  influencerId: string
) {
  const { data, error } = await supabase
    .from('influencers')
    .select(`
      *,
      influencer_handles (
        id,
        platform,
        username,
        url,
        follower_count
      ),
      influencer_stats (*)
    `)
    .eq('id', influencerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch published reviews for an influencer
 */
export async function getReviewsForInfluencer(
  supabase: ReturnType<typeof initSupabaseAdmin>,
  influencerId: string,
  limit = 50
) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, review_labels (*)')
    .eq('influencer_id', influencerId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Update influencer stats (background job use)
 */
export async function updateInfluencerStats(
  supabase: ReturnType<typeof initSupabaseAdmin>,
  influencerId: string,
  stats: {
    total_reviews: number;
    average_rating: number | null;
    sentiment_positive: number;
    sentiment_neutral: number;
    sentiment_negative: number;
    engagement_score: number;
  }
) {
  const { error } = await supabase
    .from('influencer_stats')
    .upsert(
      {
        influencer_id: influencerId,
        ...stats,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'influencer_id' }
    );

  if (error) throw error;
}

export { createClient } from '@supabase/supabase-js';
