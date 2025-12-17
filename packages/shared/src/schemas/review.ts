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
