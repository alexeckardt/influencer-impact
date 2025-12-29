'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';

export function ReviewForm() {
  const router = useRouter();
  const params = useParams();
  const influencerId = params.id as string;

  const [influencerName, setInfluencerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReviewDate, setExistingReviewDate] = useState<string | null>(null);

  const [ratings, setRatings] = useState({
    professionalism: 0,
    communication: 0,
    contentQuality: 0,
    roi: 0,
    reliability: 0,
  });
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [advice, setAdvice] = useState('');
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchInfluencerAndCheckReview = async () => {
      try {
        setLoading(true);
        
        // Fetch influencer details
        const influencerResponse = await fetch(`/api/influencers/${influencerId}`);
        if (!influencerResponse.ok) {
          setError('Failed to load influencer');
          return;
        }
        const influencerData = await influencerResponse.json();
        setInfluencerName(influencerData.name);

        // Check if user has already reviewed this influencer
        const reviewCheckResponse = await fetch(`/api/reviews/check/${influencerId}`);
        if (reviewCheckResponse.ok) {
          const reviewCheckData = await reviewCheckResponse.json();
          if (reviewCheckData.hasReviewed) {
            setHasReviewed(true);
            setExistingReviewDate(reviewCheckData.existingReview.createdAt);
          }
        }
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencerAndCheckReview();
  }, [influencerId]);

  const handleRatingChange = (category: string, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // TODO: Create API endpoint for submitting reviews
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          influencerId,
          overallRating,
          professionalismRating: ratings.professionalism,
          communicationRating: ratings.communication,
          contentQualityRating: ratings.contentQuality,
          roiRating: ratings.roi,
          reliabilityRating: ratings.reliability,
          pros,
          cons,
          advice,
          wouldWorkAgain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Redirect back to influencer profile
      router.push(`/influencer/${influencerId}`);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const overallRating =
    Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length;

  const isFormValid = overallRating > 0 && wouldWorkAgain !== null && pros && cons && advice;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !influencerName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl mb-2">Review {influencerName}</h1>
          <p className="text-gray-600 mb-8">
            Share your experience working with this influencer to help other brands make informed
            decisions.
          </p>

          {hasReviewed && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                    You've Already Reviewed This Influencer
                  </h3>
                  <p className="text-sm text-yellow-700">
                    You submitted a review for {influencerName} on{' '}
                    {existingReviewDate && new Date(existingReviewDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}. 
                    You can only submit one review per influencer.
                  </p>
                  <button
                    onClick={() => router.push(`/influencer/${influencerId}`)}
                    className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                  >
                    View your review
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Categories */}
            <div>
              <h2 className="text-xl mb-4">Rate Your Experience</h2>
              <div className="space-y-4">
                {Object.entries(ratings).map(([category, rating]) => (
                  <div key={category}>
                    <label className="block text-sm mb-2 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()} *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleRatingChange(category, value)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              value <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {overallRating > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Overall Rating:{' '}
                    <span className="text-xl font-semibold">{overallRating.toFixed(1)}</span>
                    <Star className="w-4 h-4 inline text-yellow-400 ml-1" fill="currentColor" />
                  </p>
                </div>
              )}
            </div>

            {/* Written Feedback */}
            <div>
              <label htmlFor="pros" className="block text-sm font-medium mb-2">
                What did you like about working with this influencer? *
              </label>
              <textarea
                id="pros"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., Great communication, high engagement rates, exceeded expectations..."
              />
            </div>

            <div>
              <label htmlFor="cons" className="block text-sm font-medium mb-2">
                What could have been better? *
              </label>
              <textarea
                id="cons"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., Response time could be faster, pricing was high, content didn't meet expectations..."
              />
            </div>

            <div>
              <label htmlFor="advice" className="block text-sm font-medium mb-2">
                What advice would you give to brands considering this influencer? *
              </label>
              <textarea
                id="advice"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., Book in advance, give creative freedom, set clear expectations..."
              />
            </div>

            {/* Would Work Again */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Would you work with this influencer again? *
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWouldWorkAgain(true)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    wouldWorkAgain === true
                      ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldWorkAgain(false)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    wouldWorkAgain === false
                      ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || submitting || hasReviewed}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : hasReviewed ? 'Already Reviewed' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
