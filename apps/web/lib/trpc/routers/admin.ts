/**
 * Admin Router
 * Handles admin-only functionality with type safety
 */
import { z } from 'zod';
import { router, adminProcedure } from '../init';
import { ApproveProspectResponseSchema, ProspectResponseSchema, RejectProspectResponseSchema } from '@influencer-platform/shared';
import { createServerSupabaseAdmin, approveProspectUser, rejectProspectUser } from '@/lib/admin';

export const adminRouter = router({
  /**
   * Get all prospect users
   */
  getProspects: adminProcedure
    .input(z.object({}).optional())
    .output(ProspectResponseSchema.array())
    .query(async ({ ctx }) => {
      // Use the admin client from context - it's already created with service role key
      const supabase = await createServerSupabaseAdmin();
      
      const { data, error } = await supabase
        .from('prospect_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch prospects: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Approve a prospect user
   */
  approveProspect: adminProcedure
    .input(z.object({ prospectId: z.string().uuid() }))
    .output(ApproveProspectResponseSchema)
    .mutation(async ({ ctx, input }) => {
      // Approve the prospect user
      const approvedUser = await approveProspectUser(input.prospectId, ctx.user.id);

      // Send approval email asynchronously (fire-and-forget to avoid blocking the response)
      if (approvedUser.user.email && approvedUser.tempPassword) {
        const { sendApprovalEmail } = await import('@/lib/emails');
        // Don't await - let email send in background
        sendApprovalEmail(
          approvedUser.user.email,
          approvedUser.user.user_metadata?.first_name || 'User',
          approvedUser.tempPassword
        ).catch((error) => {
          console.error('Failed to send approval email:', error);
          // Email failure shouldn't fail the approval
        });
      }

      return {
        success: true,
        message: 'Prospect approved successfully',
        userId: approvedUser.user.id,
      };
    }),

  /**
   * Reject a prospect user
   */
  rejectProspect: adminProcedure
    .input(z.object({ 
      prospectId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .output(RejectProspectResponseSchema)
    .mutation(async ({ ctx, input }) => {
      await rejectProspectUser(input.prospectId, ctx.user.id, input.reason);

      return {
        success: true,
        message: 'Prospect rejected successfully',
      };
    }),
});
