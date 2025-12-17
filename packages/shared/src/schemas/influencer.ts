import { z } from 'zod';

/**
 * Influencer profile schema
 * Core entity representing an influencer being reviewed
 */
export const InfluencerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  bio: z.string().max(1000).nullable(),
  primary_niche: z.string().min(1).max(255),
  verified: z.boolean().default(false),
  profile_image_url: z.string().url().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Influencer = z.infer<typeof InfluencerSchema>;

export const CreateInfluencerSchema = InfluencerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateInfluencer = z.infer<typeof CreateInfluencerSchema>;
