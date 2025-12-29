'use client';

import { useState, useEffect } from 'react';
import { Star, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

interface SearchInfluencersProps {
}

interface Platform {
  platform: string;
  username: string;
  url: string;
  follower_count: number;
}

interface Influencer {
  id: string;
  name: string;
  bio: string;
  niche: string;
  verified: boolean;
  profileImageUrl: string;
  platforms: Platform[];
  rating: number;
  reviewCount: number;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// On this page, would be cool to have "My Influencers" showing - idea here: https://docs.google.com/document/d/1hbp4jKx5jPMFJfIQzeSygFezd_c7GsXw62bF0n14gmw/edit?usp=sharing

// Mock influencer data
//Obviously, in the actual website, the search bar will have to pull for data when entering an influencer's Instagram/TikTok/YouTube/Facebook URL
const influencers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    handle: '@sarahjohnson',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    //likely won't include niches
    niche: 'Fashion & Lifestyle',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    followers: '850K',
    rating: 4.6,
    reviewCount: 24,
    //not sure how easy it is to scrape reviews and include top tags, this isn't necessary
    topTags: ['Professional', 'Creative', 'Reliable'],
    location: 'U.S.',
    //can delete engagement rate
    engagementRate: 4.2,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    handle: '@marcustech',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Technology & Gadgets',
    platforms: ['YouTube', 'Twitter', 'Instagram'],
    followers: '2.1M',
    rating: 4.2,
    reviewCount: 18,
    topTags: ['Knowledgeable', 'Thorough', 'Technical'],
    location: 'Canada',
    engagementRate: 3.8,
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    handle: '@emmafit',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Health & Fitness',
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    followers: '1.3M',
    rating: 4.8,
    reviewCount: 32,
    topTags: ['Authentic', 'Engaging', 'Professional'],
    location: 'U.S.',
    engagementRate: 6.5,
  },
  {
    id: '4',
    name: 'David Park',
    handle: '@davidfoodie',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Food & Culinary',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    followers: '920K',
    rating: 4.5,
    reviewCount: 27,
    topTags: ['Creative', 'Reliable', 'Great ROI'],
    location: 'Canada',
    engagementRate: 5.1,
  },
  {
    id: '5',
    name: 'Lisa Martinez',
    handle: '@lisamakeup',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Beauty & Makeup',
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    followers: '1.8M',
    rating: 4.7,
    reviewCount: 41,
    topTags: ['Professional', 'High Quality', 'Collaborative'],
    location: 'U.S.',
    engagementRate: 7.2,
  },
  {
    id: '6',
    name: 'Jason Wright',
    handle: '@jasontravel',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Travel & Adventure',
    platforms: ['Instagram', 'YouTube', 'TikTok'],
    followers: '650K',
    rating: 4.4,
    reviewCount: 19,
    topTags: ['Adventurous', 'Authentic', 'Good Engagement'],
    location: 'Canada',
    engagementRate: 4.8,
  },
  {
    id: '7',
    name: 'Nina Patel',
    handle: '@ninahome',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Home & Interior',
    platforms: ['Instagram', 'Pinterest', 'YouTube'],
    followers: '780K',
    rating: 4.9,
    reviewCount: 28,
    topTags: ['Creative', 'Detail-oriented', 'Excellent ROI'],
    location: 'U.S.',
    engagementRate: 5.9,
  },
  {
    id: '8',
    name: 'Alex Turner',
    handle: '@alexgaming',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Gaming & Esports',
    platforms: ['Twitch', 'YouTube', 'Twitter'],
    followers: '3.2M',
    rating: 4.1,
    reviewCount: 22,
    topTags: ['Engaged Audience', 'Authentic', 'Niche Expert'],
    location: 'U.S.',
    engagementRate: 3.5,
  },
];
//as noted above, don't need niches
const niches = [
  'All Niches',
  'Fashion & Lifestyle',
  'Technology & Gadgets',
  'Health & Fitness',
  'Food & Culinary',
  'Beauty & Makeup',
  'Travel & Adventure',
  'Home & Interior',
  'Gaming & Esports',
];
//likely need to add an unknown
const locations = [
  'All Locations',
  'U.S.',
  'Canada',
];

export function SearchInfluencers({}: SearchInfluencersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  // Use tRPC query for influencer search
  const { data, isLoading, error, refetch } = trpc.influencers.search.useQuery({
    page: currentPage,
    search: searchQuery || undefined,
    niche: selectedNiche && selectedNiche !== 'All Niches' ? selectedNiche : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    verified: verifiedOnly || undefined,
  });

  const influencers = data?.influencers || [];
  const pagination = data?.pagination || {
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 0,
    hasMore: false,
  };

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      refetch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedNiche, minRating, verifiedOnly, refetch]);

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
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-4xl mb-6">Discover Influencers</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or niche..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm mb-2">Niche</label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {niches.map((niche) => (
                    <option key={niche} value={niche}>
                      {niche}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Minimum Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Any</span>
                  <span>5.0</span>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Verified influencers only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading influencers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error.message || 'An error occurred'}</p>
            <button
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
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
                      src={influencer.profileImageUrl}
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
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {influencer.niche}
                    </span>
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
                <p className="text-gray-600 mb-4">No influencers found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedNiche('All Niches');
                    setMinRating(0);
                    setVerifiedOnly(false);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}