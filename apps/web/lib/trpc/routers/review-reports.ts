/**
 * Review Reports Router
 * Handles all review reporting functionality with type safety
 */
import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../init';
import {
  createReportInputSchema,
  updateReportStatusInputSchema,
  getReviewReportsInputSchema,
  checkReportStatusInputSchema,
} from '@influencer-platform/shared';

export const reviewReportsRouter = router({
  /**
   * Check if the current user has reported a specific review
   */
  checkReportStatus: protectedProcedure
    .input(checkReportStatusInputSchema)
    .output(z.object({ hasReported: z.boolean() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('review_reports')
        .select('id')
        .eq('review_id', input.reviewId)
        .eq('reporter_id', ctx.user.id)
        .maybeSingle();

      return { hasReported: !!data };
    }),

  /**
   * Create a new review report
   */
  createReport: protectedProcedure
    .input(createReportInputSchema)
    .output(z.object({ success: z.boolean(), reportId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already reported this review
      const { data: existing } = await ctx.supabase
        .from('review_reports')
        .select('id')
        .eq('review_id', input.reviewId)
        .eq('reporter_id', ctx.user.id)
        .maybeSingle();

      if (existing) {
        throw new Error('You have already reported this review');
      }

      // Verify review exists
      const { data: review, error: reviewError } = await ctx.supabase
        .from('reviews')
        .select('id')
        .eq('id', input.reviewId)
        .single();

      if (reviewError || !review) {
        throw new Error('Review not found');
      }

      // Create the report
      const { data: report, error: reportError } = await ctx.supabase
        .from('review_reports')
        .insert({
          review_id: input.reviewId,
          reporter_id: ctx.user.id,
          reasons: input.reasons,
          additional_info: input.additionalInfo || null,
          status: 'open',
        })
        .select('id')
        .single();

      if (reportError || !report) {
        throw new Error('Failed to create report');
      }

      return { success: true, reportId: report.id };
    }),

  /**
   * Get all review reports (admin only)
   */
  getReports: adminProcedure
    .input(getReviewReportsInputSchema)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('review_reports')
        .select(`
          id,
          review_id,
          reporter_id,
          reasons,
          additional_info,
          status,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at,
          review:reviews!review_reports_review_id_fkey (
            id,
            overall_rating,
            pros,
            cons,
            advice,
            influencer:influencers!reviews_influencer_id_fkey (
              id,
              name
            )
          ),
          reporter:users!review_reports_reporter_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          reviewer:users!review_reports_reviewed_by_fkey (
            id,
            first_name,
            last_name
          )
        `);

      // Apply filters
      if (input.status) {
        query = query.eq('status', input.status);
      } else if (!input.showAll) {
        query = query.neq('status', 'closed');
      }

      const { data: reports, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch reports');
      }

      // Transform Supabase array format to single objects
      const transformedReports = (reports || []).map((report: any) => ({
        ...report,
        review: Array.isArray(report.review) ? report.review[0] || null : report.review,
        reporter: Array.isArray(report.reporter) ? report.reporter[0] || null : report.reporter,
        reviewer: Array.isArray(report.reviewer) ? report.reviewer[0] || null : report.reviewer,
      }));

      return { reports: transformedReports };
    }),

  /**
   * Update report status (admin only)
   */
  updateReportStatus: adminProcedure
    .input(updateReportStatusInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('review_reports')
        .update({
          status: input.status,
          reviewed_by: ctx.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.reportId);

      if (error) {
        throw new Error('Failed to update report status');
      }

      return { success: true };
    }),
});
