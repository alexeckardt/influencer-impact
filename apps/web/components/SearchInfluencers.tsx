import { useState } from 'react';
import { Star, Search, Filter, LogOut, Instagram, Youtube, Twitter, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SearchInfluencersProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'search' | 'profile') => void;
  onViewProfile: (influencerId: string) => void;
  onLogout: () => void;
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

export function SearchInfluencers({ onNavigate, onViewProfile, onLogout }: SearchInfluencersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  //don't need to include eng rate to profiles or in search filters.
  const [minEngagement, setMinEngagement] = useState(0);

  const filteredInfluencers = influencers.filter((influencer) => {
    const matchesSearch =
      influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.niche.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = selectedNiche === 'All Niches' || influencer.niche === selectedNiche;
    const matchesRating = influencer.rating >= minRating;
    const matchesLocation = selectedLocation === 'All Locations' || influencer.location === selectedLocation;
    const matchesEngagement = influencer.engagementRate >= minEngagement;
    return matchesSearch && matchesNiche && matchesRating && matchesLocation && matchesEngagement;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Star className="w-8 h-8 text-blue-600" fill="currentColor" />
              <span className="text-xl">InfluencerInsight</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

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
                placeholder="Search by name, handle, or niche..."
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
                <label className="block text-sm mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Minimum Engagement Rate: {minEngagement > 0 ? minEngagement.toFixed(1) : 'Any'}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Any</span>
                  <span>10.0</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredInfluencers.length} influencer{filteredInfluencers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Influencer Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onViewProfile(influencer.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <ImageWithFallback
                  src={influencer.image}
                  alt={influencer.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl truncate">{influencer.name}</h3>
                  <p className="text-gray-600 text-sm truncate">{influencer.handle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      <span className="text-sm">{influencer.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({influencer.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {influencer.niche}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Platforms:</p>
                <div className="flex gap-2">
                  {influencer.platforms.slice(0, 3).map((platform) => (
                    <span
                      key={platform}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {influencer.topTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredInfluencers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No influencers found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedNiche('All Niches');
                setMinRating(0);
                setSelectedLocation('All Locations');
                setMinEngagement(0);
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}