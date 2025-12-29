/**
 * Reviews Router
 * Handles review creation and retrieval with type safety
 */
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../init';
import {
  createReviewInputSchema,
  getReviewInputSchema,
  checkUserReviewInputSchema,
} from '@influencer-platform/shared';

export const reviewsRouter = router({
  /**
   * Create a new review
   */
  create: protectedProcedure
    .input(createReviewInputSchema)
    .output(z.object({ 
      success: z.boolean(), 
      reviewId: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify influencer exists
      const { data: influencer, error: influencerError } = await ctx.supabase
        .from('influencers')
        .select('id')
        .eq('id', input.influencerId)
        .single();

      if (influencerError || !influencer) {
        throw new Error('Influencer not found');
      }

      // Check if user already reviewed this influencer
      const { data: existingReview } = await ctx.supabase
        .from('reviews')
        .select('id')
        .eq('influencer_id', input.influencerId)
        .eq('reviewer_id', ctx.user.id)
        .maybeSingle();

      if (existingReview) {
        throw new Error('You have already reviewed this influencer');
      }

      // Calculate overall rating (average of all ratings)
      const overallRating = (
        input.professionalismRating +
        input.communicationRating +
        input.contentQualityRating +
        input.roiRating +
        input.reliabilityRating
      ) / 5;

      // Create the review
      const { data: review, error: reviewError } = await ctx.supabase
        .from('reviews')
        .insert({
          influencer_id: input.influencerId,
          reviewer_id: ctx.user.id,
          overall_rating: overallRating,
          professionalism_rating: input.professionalismRating,
          communication_rating: input.communicationRating,
          content_quality_rating: input.contentQualityRating,
          roi_rating: input.roiRating,
          reliability_rating: input.reliabilityRating,
          pros: input.pros,
          cons: input.cons,
          advice: input.advice,
          would_work_again: input.wouldWorkAgain,
        })
        .select('id')
        .single();

      if (reviewError || !review) {
        console.error('Review creation error:', reviewError);
        throw new Error('Failed to create review');
      }

      return {
        success: true,
        reviewId: review.id,
        message: 'Review submitted successfully',
      };
    }),

  /**
   * Get a specific review by ID
   */
  getById: publicProcedure
    .input(getReviewInputSchema)
    .query(async ({ ctx, input }) => {
      const { data: review, error } = await ctx.supabase
        .from('reviews')
        .select(`
          *,
          influencer:influencers!reviews_influencer_id_fkey (
            id,
            name,
            platform,
            handle
          ),
          reviewer:users!reviews_reviewer_id_fkey (
            id,
            first_name,
            last_name,
            company,
            job_title,
            public_profile
          )
        `)
        .eq('id', input.reviewId)
        .single();

      if (error || !review) {
        throw new Error('Review not found');
      }

      return review;
    }),

  /**
   * Check if current user has reviewed a specific influencer
   */
  checkUserReview: protectedProcedure
    .input(checkUserReviewInputSchema)
    .output(z.object({ 
      hasReviewed: z.boolean(),
      reviewId: z.string().nullable(),
    }))
    .query(async ({ ctx, input }) => {
      const { data: review } = await ctx.supabase
        .from('reviews')
        .select('id')
        .eq('influencer_id', input.influencerId)
        .eq('reviewer_id', ctx.user.id)
        .maybeSingle();

      return {
        hasReviewed: !!review,
        reviewId: review?.id || null,
      };
    }),
});
