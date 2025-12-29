'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star, Edit2, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ReviewForm } from '@/components/ReviewForm';

interface Influencer {
  id: string;
  name: string;
  profileImageUrl: string;
  niche: string;
  verified: boolean;
}

interface Reviewer {
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  yearsInPR: string;
}

interface Review {
  id: string;
  overallRating: number;
  professionalism: number;
  communication: number;
  contentQuality: number;
  roi: number;
  reliability: number;
  pros: string;
  cons: string;
  advice: string;
  wouldWorkAgain: boolean;
  createdAt: string;
  updatedAt: string;
  isAuthor: boolean;
  influencer: Influencer | null;
  reviewer: Reviewer | null;
}

export function ReviewDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  console.log("Review Object:", review);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/reviews/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Review not found');
          } else if (response.status === 401) {
            setError('Please log in to view this review');
          } else {
            setError('Failed to load review');
          }
          return;
        }

        const data = await response.json();
        setReview(data);
      } catch (err) {
        console.error('Error fetching review:', err);
        setError('An error occurred while loading the review');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleEditSuccess = async () => {
    // Refresh the review data
    const updatedData = await fetch(`/api/reviews/${id}`).then(r => r.json());
    setReview(updatedData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Review not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If editing, show the ReviewForm component
  if (isEditing && review) {
    return (
      <ReviewForm
        mode="edit"
        reviewId={id}
        influencerId={review.influencer?.id}
        influencerName={review.influencer?.name}
        initialValues={{
          professionalism: review.professionalism,
          communication: review.communication,
          contentQuality: review.contentQuality,
          roi: review.roi,
          reliability: review.reliability,
          pros: review.pros,
          cons: review.cons,
          advice: review.advice,
          wouldWorkAgain: review.wouldWorkAgain,
        }}
        onCancel={() => setIsEditing(false)}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Influencer Info Card */}
        {review.influencer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={review.influencer.profileImageUrl}
                alt={review.influencer.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">{review.influencer.name}</h2>
                  {review.influencer.verified && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{review.influencer.niche}</p>
                <button
                  onClick={() => router.push(`/influencer/${review.influencer!.id}`)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  View Full Profile
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{review.overallRating.toFixed(1)}</span>
                  <Star className="w-7 h-7 text-yellow-400" fill="currentColor" />
                </div>
                {review.wouldWorkAgain && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Would work again
                  </span>
                )}
              </div>
              {review.reviewer ? (
                <p className="text-gray-600">
                  Review by {review.reviewer.firstName} {review.reviewer.lastName}
                  {review.reviewer.jobTitle && review.reviewer.companyName && (
                    <span> • {review.reviewer.jobTitle} at {review.reviewer.companyName}</span>
                  )}
                </p>
              ) : (
                <p className="text-gray-600">Anonymous Review</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {new Date(review.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
                {review.updatedAt !== review.createdAt && ' (edited)'}
              </p>
            </div>
            {review.isAuthor && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Review
              </button>
            )}
          </div>

          {/* Rating Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Professionalism</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-semibold">{review.professionalism.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Communication</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-semibold">{review.communication.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Content Quality</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-semibold">{review.contentQuality.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-semibold">{review.roi.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Reliability</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-semibold">{review.reliability.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>

          {/* Written Feedback */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">What did you like?</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{review.pros}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">What could have been better?</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{review.cons}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Advice to other brands</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{review.advice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
