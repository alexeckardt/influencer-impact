'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}


interface RecentlyViewedInfluencersProps {
  perPage?: number;
}

export function RecentlyViewedInfluencers({ perPage = 12 }: RecentlyViewedInfluencersProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  // Use tRPC query for recently viewed influencers
  const { data, isLoading, error } = trpc.influencers.getRecentlyViewed.useQuery({
    page: currentPage,
    perPage,
  });

  const influencers = data?.influencers || [];
  const pagination = data?.pagination || {
    page: 1,
    perPage,
    total: 0,
    totalPages: 0,
    hasMore: false,
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onViewProfile = (influencerId: string) => {
    router.push(`/influencer/${influencerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl">Recently Viewed</h1>
          </div>
          <p className="text-gray-600">
            Influencers you've recently viewed, sorted by most recent
          </p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading recently viewed influencers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error.message || 'An error occurred'}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {influencers.length} of {pagination.total} influencer{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Influencer Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onViewProfile(influencer.id)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <ImageWithFallback
                      src={influencer.profileImageUrl ?? undefined}
                      alt={influencer.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl truncate">{influencer.name}</h3>
                        {influencer.verified && (
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                          <span className="text-sm">{influencer.rating > 0 ? influencer.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({influencer.reviewCount} review{influencer.reviewCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {influencer.niche}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(influencer.lastViewedAt)}
                      </span>
                    </div>
                  </div>

                  {influencer.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {influencer.bio}
                    </p>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Platforms:</p>
                    <div className="flex gap-2">
                      {influencer.platforms.slice(0, 3).map((handle) => (
                        <span
                          key={handle.platform}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize"
                        >
                          {handle.platform}
                        </span>
                      ))}
                      {influencer.platforms.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{influencer.platforms.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {influencers.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No recently viewed influencers</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start exploring influencers to see them here
                </p>
                <button
                  onClick={() => router.push('/search')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Influencers
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}