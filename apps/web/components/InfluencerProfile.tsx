import { useState } from 'react';
import { Star, ArrowLeft, LogOut, Instagram, Youtube, Twitter, TrendingUp, MessageSquare, DollarSign, Clock, ThumbsUp, ExternalLink } from 'lucide-react';
import { ReviewModal } from './ReviewModal';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useRouter } from 'next/navigation';

interface InfluencerProfileProps {
  influencerId: string | null;
  onBack: () => void;
  onLogout: () => void;
}

// Mock data
const influencersData: { [key: string]: any } = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    handle: '@sarahjohnson',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Fashion & Lifestyle',
    platforms: [
      { name: 'Instagram', icon: Instagram, followers: '850K', url: 'https://instagram.com/sarahjohnson' },
      { name: 'TikTok', icon: TrendingUp, followers: '1.2M', url: 'https://tiktok.com/@sarahjohnson' },
      { name: 'YouTube', icon: Youtube, followers: '320K', url: 'https://youtube.com/@sarahjohnson' },
      { name: 'Facebook', icon: MessageSquare, followers: '420K', url: 'https://facebook.com/sarahjohnson' },
    ],
    overallRating: 4.6,
    totalReviews: 24,
    location: 'U.S.',
    engagementRate: 4.2,
    ratings: {
      professionalism: 4.8,
      communication: 4.7,
      contentQuality: 4.9,
      roi: 4.3,
      reliability: 4.5,
    },
    reviews: [
      {
        id: 1,
        //Think we just include the type of company, which will generally just be PR Agency and years in PR instead of job titles so it's not as obvious who has left what review
        // We'll also need to add a button on reviews to flag reviews that are against policy (things that could be considered bullying, whatever else we talk about w/ lawyers)
        // Maybe with the flag button we have one of those hover-able question mark buttons that link out to content policy & what's acceptable
        reviewer: 'Senior PR Manager',
        company: 'Tech startup',
        yearsInPR: '6-10 years',
        date: '2024-12-10',
        overallRating: 5,
        professionalism: 5,
        communication: 5,
        contentQuality: 5,
        roi: 4,
        reliability: 5,
        pros: 'Extremely professional, delivered content ahead of schedule, great engagement rates, very collaborative',
        cons: 'Premium pricing, but worth it for the quality',
        advice: 'Give her creative freedom - she knows her audience best',
        wouldWorkAgain: true,
      },
      {
        id: 2,
        reviewer: 'PR Coordinator',
        company: 'Fashion brand',
        yearsInPR: '3-5 years',
        date: '2024-11-28',
        overallRating: 4,
        professionalism: 4,
        communication: 4,
        contentQuality: 5,
        roi: 4,
        reliability: 4,
        pros: 'Beautiful content, strong brand alignment, engaged audience',
        cons: 'Can be slow to respond during busy periods',
        advice: 'Book well in advance, her calendar fills up quickly',
        wouldWorkAgain: true,
      },
      {
        id: 3,
        reviewer: 'Account Director',
        company: 'PR agency',
        yearsInPR: '10+ years',
        date: '2024-11-15',
        overallRating: 5,
        professionalism: 5,
        communication: 5,
        contentQuality: 5,
        roi: 5,
        reliability: 5,
        pros: 'One of the best influencers we\'ve worked with. Professional, reliable, great results',
        cons: 'None - genuinely impressed',
        advice: 'Invest in a long-term partnership',
        wouldWorkAgain: true,
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Marcus Chen',
    handle: '@marcustech',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGluZmx1ZW5jZXJ8ZW58MXx8fHwxNzY1NjMzOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    niche: 'Technology & Gadgets',
    platforms: [
      { name: 'YouTube', icon: Youtube, followers: '2.1M', url: 'https://youtube.com/@marcustech' },
      { name: 'Twitter', icon: Twitter, followers: '450K', url: 'https://twitter.com/marcustech' },
      { name: 'Instagram', icon: Instagram, followers: '620K', url: 'https://instagram.com/marcustech' },
      { name: 'Facebook', icon: MessageSquare, followers: '180K', url: 'https://facebook.com/marcustech' },
    ],
    overallRating: 4.2,
    totalReviews: 18,
    location: 'Canada',
    engagementRate: 3.8,
    ratings: {
      professionalism: 4.5,
      communication: 3.8,
      contentQuality: 4.7,
      roi: 4.0,
      reliability: 4.1,
    },
    reviews: [
      {
        id: 1,
        reviewer: 'Brand Manager',
        company: 'Electronics company',
        yearsInPR: '3-5 years',
        date: '2024-12-05',
        overallRating: 4,
        professionalism: 5,
        communication: 3,
        contentQuality: 5,
        roi: 4,
        reliability: 4,
        pros: 'Excellent technical knowledge, thorough reviews, good reach',
        cons: 'Communication could be faster, sometimes takes days to respond',
        advice: 'Be patient with response times but the final product is worth it',
        wouldWorkAgain: true,
      },
    ],
  },
};

export function InfluencerProfile({ influencerId, onBack, onLogout }: InfluencerProfileProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const influencer = influencerId ? influencersData[influencerId] : null;

  const router = useRouter();




  if (!influencer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Influencer not found</p>
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
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/')}
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
                src={influencer.image}
                alt={influencer.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl mb-2">{influencer.name}</h1>
              <p className="text-gray-600 mb-4">{influencer.handle}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {influencer.niche}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {influencer.location}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {influencer.engagementRate}% engagement
                </span>
              </div>
              
              {/* Social Media Links */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Social Media Profiles:</p>
                <div className="flex flex-wrap gap-3">
                  {influencer.platforms.map((platform: any, index: number) => (
                    <a
                      key={index}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <platform.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{platform.name}</span>
                      <span className="text-xs text-gray-500">({platform.followers})</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">{influencer.overallRating.toFixed(1)}</span>
                    <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  </div>
                  <p className="text-sm text-gray-600">{influencer.totalReviews} reviews</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
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
            {Object.entries(influencer.ratings).map(([category, rating]: [string, any]) => (
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
          {influencer.reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{review.reviewer}</span>
                    {review.wouldWorkAgain && (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        Would work again
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {review.company} • {review.yearsInPR} experience
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xl">{review.overallRating.toFixed(1)}</span>
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
          ))}
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          influencerName={influencer.name}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => {
            setShowReviewModal(false);
            // In real app, would refresh reviews
          }}
        />
      )}
    </div>
  );
}