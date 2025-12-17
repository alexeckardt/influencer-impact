import { z } from 'zod';

/**
 * Aggregated stats schema
 * Denormalized statistics for each influencer
 * Updated asynchronously by background jobs
 */
export const InfluencerStatsSchema = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  total_reviews: z.number().int().nonnegative().default(0),
  average_rating: z.number().min(0).max(5).nullable().default(null),
  sentiment_distribution: z.object({
    positive: z.number().int().nonnegative().default(0),
    neutral: z.number().int().nonnegative().default(0),
    negative: z.number().int().nonnegative().default(0),
  }),
  engagement_score: z.number().min(0).max(100).default(0),
  last_updated: z.string().datetime(),
  created_at: z.string().datetime(),
});

export type InfluencerStats = z.infer<typeof InfluencerStatsSchema>;

export const UpdateInfluencerStatsSchema = InfluencerStatsSchema.omit({
  id: true,
  created_at: true,
});

export type UpdateInfluencerStats = z.infer<typeof UpdateInfluencerStatsSchema>;
