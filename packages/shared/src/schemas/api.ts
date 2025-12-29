/**
 * Shared API schemas for validation and type inference
 * These are used by tRPC for runtime validation and TypeScript types
 */
import { z } from 'zod';

// ============================================================================
// Review Report Schemas
// ============================================================================

export const reportReasonSchema = z.enum([
  'Spam or Fake',
  'Offensive Content',
  'Inaccurate Information',
  'Conflict of Interest',
  'Duplicate Review',
  'Inappropriate Language',
  'Other',
]);

export const reportStatusSchema = z.enum(['open', 'investigating', 'closed']);

export const createReportInputSchema = z.object({
  reviewId: z.string().uuid(),
  reasons: z.array(reportReasonSchema).min(1, 'At least one reason is required'),
  additionalInfo: z.string().optional(),
});

export const updateReportStatusInputSchema = z.object({
  reportId: z.string().uuid(),
  status: reportStatusSchema,
});

export const getReviewReportsInputSchema = z.object({
  status: reportStatusSchema.optional(),
  showAll: z.boolean().optional().default(false),
});

export const checkReportStatusInputSchema = z.object({
  reviewId: z.string().uuid(),
});

// Review Report Output Type
export const reviewReportSchema = z.object({
  id: z.string(),
  review_id: z.string(),
  reporter_id: z.string(),
  reasons: z.array(z.string()),
  additional_info: z.string().nullable(),
  status: reportStatusSchema,
  reviewed_by: z.string().nullable(),
  reviewed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  review: z.object({
    id: z.string(),
    overall_rating: z.number(),
    pros: z.string(),
    cons: z.string(),
    advice: z.string(),
    influencer: z.object({
      id: z.string(),
      name: z.string(),
    }).nullable(),
  }).nullable(),
  reporter: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
  }).nullable(),
  reviewer: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }).nullable(),
});

export type ReviewReport = z.infer<typeof reviewReportSchema>;

// ============================================================================
// Review Schemas
// ============================================================================

export const createReviewInputSchema = z.object({
  influencerId: z.string().uuid(),
  professionalismRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  contentQualityRating: z.number().min(1).max(5),
  roiRating: z.number().min(1).max(5),
  reliabilityRating: z.number().min(1).max(5),
  pros: z.string().min(10, 'Pros must be at least 10 characters'),
  cons: z.string().min(10, 'Cons must be at least 10 characters'),
  advice: z.string().min(10, 'Advice must be at least 10 characters'),
  wouldWorkAgain: z.boolean(),
});

export const getReviewInputSchema = z.object({
  reviewId: z.string().uuid(),
});

export const checkUserReviewInputSchema = z.object({
  influencerId: z.string().uuid(),
});

// ============================================================================
// Influencer Schemas
// ============================================================================

export const searchInfluencersInputSchema = z.object({
  query: z.string().optional(),
  platform: z.enum(['twitter', 'instagram', 'tiktok', 'youtube']).optional(),
  minFollowers: z.number().optional(),
  maxFollowers: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const getInfluencerInputSchema = z.object({
  influencerId: z.string().uuid(),
});

// ============================================================================
// Admin Schemas
// ============================================================================

export const approveProspectInputSchema = z.object({
  prospectId: z.string().uuid(),
});

export const rejectProspectInputSchema = z.object({
  prospectId: z.string().uuid(),
  reason: z.string().optional(),
});

// ============================================================================
// User Schemas
// ============================================================================

export const updateProfileInputSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  publicProfile: z.boolean().optional(),
});
