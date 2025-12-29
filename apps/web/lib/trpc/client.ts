/**
 * tRPC Client for React
 * Use this to make type-safe API calls from your components
 */
'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/lib/trpc/routers';

export const trpc = createTRPCReact<AppRouter>();
