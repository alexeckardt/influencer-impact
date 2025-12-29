/**
 * Shared index - export all schemas and types
 */

export * from './schemas/influencer';
export * from './schemas/handle';
export * from './schemas/review';
export * from './schemas/stats';
export * from './schemas/review-label';
export * from './schemas/api';
export * from './schemas/user';

/**
 * Utilities
 */
export const SENTIMENT_LABELS = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
} as const;

export const PLATFORMS = {
  twitter: 'Twitter/X',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
} as const;
