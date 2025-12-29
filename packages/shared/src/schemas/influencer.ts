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

const PlatformSchema = z.object({
  platform: z.string(),
  username: z.string(),
  url: z.string().url(),
  followerCount: z.number(),
});

const ReviewSchema = z.object({
  id: z.string(),
  overallRating: z.number(),
  professionalism: z.number(),
  communication: z.number(),
  contentQuality: z.number(),
  roi: z.number(),
  reliability: z.number(),
  pros: z.string().nullable(),
  cons: z.string().nullable(),
  advice: z.string().nullable(),
  wouldWorkAgain: z.boolean(),
  createdAt: z.string().datetime(),
  reviewer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    companyName: z.string().nullable(),
    jobTitle: z.string().nullable(),
    yearsInPR: z.number().nullable(),
  }).nullable(),
});

export const InfluencerDetailResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bio: z.string().nullable(),
  niche: z.string(),
  profileImageUrl: z.string().nullable(),
  verified: z.boolean(),
  platforms: z.array(PlatformSchema),
  ratings: z.object({
    overall: z.number(),
    professionalism: z.number(),
    communication: z.number(),
    contentQuality: z.number(),
    roi: z.number(),
    reliability: z.number(),
  }),
  totalReviews: z.number(),
  engagementRate: z.number(),
  reviews: z.array(ReviewSchema),
});
export type InfluencerDetailResponse = z.infer<typeof InfluencerDetailResponseSchema>;

const InfluencerSearchItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bio: z.string().nullable(),
  niche: z.string(),
  verified: z.boolean(),
  profileImageUrl: z.string().nullable(),
  platforms: z.array(PlatformSchema),
  rating: z.number(),
  reviewCount: z.number(),
});
export type InfluencerSearchItem = z.infer<typeof InfluencerSearchItemSchema>;

export const InfluencerSearchResponseSchema = z.object({
  influencers: z.array(InfluencerSearchItemSchema),
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});
export type InfluencerSearchResponse = z.infer<typeof InfluencerSearchResponseSchema>;