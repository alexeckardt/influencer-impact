/**
 * API Type Exports
 * 
 * This file provides a centralized location for all API-related types.
 * Import these types in your components for type-safe API interactions.
 * 
 * Usage:
 *   import type { ReviewReport, CreateReviewInput } from '@/lib/trpc/types';
 */

// Re-export all Zod-inferred types from shared package
export type {
  ReviewReport,
} from '@influencer-platform/shared';

// Import schemas to infer additional types
import type {
  createReportInputSchema,
  updateReportStatusInputSchema,
  getReviewReportsInputSchema,
  checkReportStatusInputSchema,
  createReviewInputSchema,
  getReviewInputSchema,
  checkUserReviewInputSchema,
  searchInfluencersInputSchema,
  getInfluencerInputSchema,
  approveProspectInputSchema,
  rejectProspectInputSchema,
  updateProfileInputSchema,
  reportStatusSchema,
  reportReasonSchema,
} from '@influencer-platform/shared';
import { z } from 'zod';

// Review Reports
export type CreateReportInput = z.infer<typeof createReportInputSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusInputSchema>;
export type GetReviewReportsInput = z.infer<typeof getReviewReportsInputSchema>;
export type CheckReportStatusInput = z.infer<typeof checkReportStatusInputSchema>;
export type ReportStatus = z.infer<typeof reportStatusSchema>;
export type ReportReason = z.infer<typeof reportReasonSchema>;

// Reviews
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
export type GetReviewInput = z.infer<typeof getReviewInputSchema>;
export type CheckUserReviewInput = z.infer<typeof checkUserReviewInputSchema>;

// Influencers
export type SearchInfluencersInput = z.infer<typeof searchInfluencersInputSchema>;
export type GetInfluencerInput = z.infer<typeof getInfluencerInputSchema>;

// Admin
export type ApproveProspectInput = z.infer<typeof approveProspectInputSchema>;
export type RejectProspectInput = z.infer<typeof rejectProspectInputSchema>;

// User
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

/**
 * Type Helper: Extract router output types
 * 
 * Usage:
 *   type ReportsOutput = RouterOutput['reviewReports']['getReports'];
 */
import type { AppRouter } from './routers';
import type { inferRouterOutputs, inferRouterInputs } from '@trpc/server';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

/**
 * Examples of using RouterOutput:
 * 
 * type ReportsList = RouterOutput['reviewReports']['getReports'];
 * type SingleReview = RouterOutput['reviews']['getById'];
 * type CreateReviewResult = RouterOutput['reviews']['create'];
 */
