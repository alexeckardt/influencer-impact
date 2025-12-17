// Environment variables validation schema
import { z } from 'zod';

const EnvironmentSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

type Environment = z.infer<typeof EnvironmentSchema>;

export function validateEnv(): Environment {
  try {
    return EnvironmentSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();
