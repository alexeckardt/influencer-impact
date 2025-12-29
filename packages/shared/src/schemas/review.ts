import { z } from 'zod';

/**
 * Review schema
 * Represents a user's review/feedback on an influencer
 */
export const SentimentEnum = z.enum(['positive', 'neutral', 'negative']);
export type Sentiment = z.infer<typeof SentimentEnum>;

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().min(10).max(5000),
  rating: z.number().int().min(1).max(5),
  sentiment: SentimentEnum.optional(),
  is_anonymous: z.boolean().default(false),
  helpful_count: z.number().int().nonnegative().default(0),
  unhelpful_count: z.number().int().nonnegative().default(0),
  status: z.enum(['published', 'draft', 'flagged']).default('draft'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewSchema = ReviewSchema.omit({
  id: true,
  sentiment: true,
  helpful_count: true,
  unhelpful_count: true,
  created_at: true,
  updated_at: true,
});

export type CreateReview = z.infer<typeof CreateReviewSchema>;

/**
 * Review Detail Response Schema
 * Used when fetching a single review with nested influencer and reviewer data
 */
export const ReviewDetailResponseSchema = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  overall_rating: z.number(),
  professionalism_rating: z.number(),
  communication_rating: z.number(),
  content_quality_rating: z.number(),
  roi_rating: z.number(),
  reliability_rating: z.number(),
  pros: z.string().nullable(),
  cons: z.string().nullable(),
  advice: z.string().nullable(),
  would_work_again: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  influencer: z.object({
    id: z.string().uuid(),
    name: z.string(),
    primary_niche: z.string(),
    profile_image_url: z.string().nullable(),
    verified: z.boolean(),
  }).nullable(),
  reviewer: z.object({
    id: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
    company: z.string().nullable(),
    job_title: z.string().nullable(),
    public_profile: z.boolean(),
  }).nullable(),
});

export type ReviewDetailResponse = z.infer<typeof ReviewDetailResponseSchema>;
