import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const ApproveProspectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().uuid(),
});

export const RejectProspectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ProspectResponseSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  email: z.string().email(),
  company: z.string().nullable(),
  job_title: z.string().nullable(),
  linkedin_url: z.string().url().nullable(),
  years_experience: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  reviewed_at: z.string().nullable(),
  reviewed_by: z.string().uuid().nullable(),
  rejection_reason: z.string().nullable(),
});
export type ProspectResponse = z.infer<typeof ProspectResponseSchema>;