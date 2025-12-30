'use client';

import { useEffect } from 'react';
import { Star, ArrowLeft, Instagram, Youtube, Twitter, TrendingUp, MessageSquare, ThumbsUp, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

interface InfluencerProfileProps {
  influencerId: string | null;
}

// Helper to get platform icon
const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('instagram')) return Instagram;
  if (platformLower.includes('youtube')) return Youtube;
  if (platformLower.includes('twitter') || platformLower.includes('x')) return Twitter;
  if (platformLower.includes('tiktok')) return TrendingUp;
  if (platformLower.includes('facebook')) return MessageSquare;
  return MessageSquare; // default
};

// Helper to format follower count
const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export function InfluencerProfile({ influencerId }: InfluencerProfileProps) {
  const router = useRouter();

  // Use tRPC query for influencer data
  const { data: influencer, isLoading, error: queryError } = trpc.influencers.getById.useQuery(
    { id: influencerId! },
    { enabled: !!influencerId },
  );

  // Record view mutation
  const recordViewMutation = trpc.influencers.recordView.useMutation();

  // Record view when component mounts
  useEffect(() => {
    if (influencerId && !isLoading && influencer) {
      recordViewMutation.mutate({ influencerId });
    }
  //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [influencerId, influencer]); // Only run when influencer data is loaded

  // Derive error message from queryError instead of storing in state
  const error = queryError
    ? queryError.message.includes('not found')
      ? 'Influencer not found'
      : queryError.message.includes('Unauthorized')
      ? 'Please log in to view this profile'
      : 'Failed to load influencer profile'
    : null;

  const loading = isLoading;

  const onBack = () => {
    router.back();
  };

  const startWriteReview = () => {
    router.push(`/influencer/${influencerId}/review`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !influencer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Influencer not found'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        {/* Influencer Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={influencer.profileImageUrl || undefined}
                alt={influencer.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl">{influencer.name}</h1>
                {influencer.verified && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {influencer.bio && (
                <p className="text-gray-600 mb-4">{influencer.bio}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {influencer.niche}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {influencer.location || 'Location Unknown'}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {influencer.engagementRate.toFixed(1)}% engagement
                </span>
              </div>
              
              {/* Social Media Links */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Social Media Profiles:</p>
                <div className="flex flex-wrap gap-3">
                  {influencer.platforms.map((platform, index) => {
                    const Icon = getPlatformIcon(platform.platform);
                    return (
                      <a
                        key={index}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700 capitalize">{platform.platform}</span>
                        <span className="text-xs text-gray-500">({formatFollowerCount(platform.followerCount)})</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{influencer.ratings.overall > 0 ? influencer.ratings.overall.toFixed(1) : 'N/A'}</span>
                    <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  </div>
                  <p className="text-sm text-gray-600">{influencer.totalReviews} review{influencer.totalReviews !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={startWriteReview}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write a Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl mb-6">Rating Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(influencer.ratings)
              .filter(([category]) => category !== 'overall')
              .map(([category, rating]: [string, number]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="capitalize text-gray-700">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="flex items-center gap-1">
                    {rating.toFixed(1)}
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          <h2 className="text-2xl">Reviews ({influencer.reviews.length})</h2>
          {influencer.reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-3">No reviews yet</p>
              <p className="text-sm text-gray-500 mb-7">Be the first to review {influencer.name}!</p>

              <button
                  onClick={startWriteReview}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write a Review
                </button>
            </div>
          ) : (
            influencer.reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/review/${review.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>
                      {review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Anonymous'}
                    </span>
                    {review.wouldWorkAgain && (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        Would work again
                      </span>
                    )}
                  </div>
                  {review.reviewer && (
                    <p className="text-sm text-gray-600">
                      {review.reviewer.jobTitle} at {review.reviewer.companyName} • {review.reviewer.yearsInPR} experience
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xl">{review.overallRating.toFixed(1)}</span>
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Individual Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Professional</p>
                  <p className="flex items-center justify-center gap-1">
                    {review.professionalism.toFixed(1)}
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Comms</p>
                  <p className="flex items-center justify-center gap-1">
                    {review.communication.toFixed(1)}
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Content</p>
                  <p className="flex items-center justify-center gap-1">
                    {review.contentQuality.toFixed(1)}
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">ROI</p>
                  <p className="flex items-center justify-center gap-1">
                    {review.roi.toFixed(1)}
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Reliability</p>
                  <p className="flex items-center justify-center gap-1">
                    {review.reliability.toFixed(1)}
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Pros:</p>
                  <p className="text-gray-900">{review.pros}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1">Cons:</p>
                  <p className="text-gray-900">{review.cons}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-1">Advice to Brands:</p>
                  <p className="text-gray-900">{review.advice}</p>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}