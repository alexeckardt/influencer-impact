import { z } from 'zod';

/**
 * Platform types for influencer handles
 * Represents platform identifier and username
 */
export const PlatformEnum = z.enum(['twitter', 'instagram', 'tiktok', 'youtube']);
export type Platform = z.infer<typeof PlatformEnum>;

export const HandleSchema = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  platform: PlatformEnum,
  username: z.string().min(1).max(255),
  url: z.string().url(),
  follower_count: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Handle = z.infer<typeof HandleSchema>;

export const CreateHandleSchema = HandleSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateHandle = z.infer<typeof CreateHandleSchema>;
