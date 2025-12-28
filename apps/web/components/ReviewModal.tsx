import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface ReviewModalProps {
  influencerName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReviewModal({ influencerName, onClose, onSubmit }: ReviewModalProps) {
  const [ratings, setRatings] = useState({
    professionalism: 0,
    communication: 0,
    contentQuality: 0,
    contentPerformance: 0,
    reliability: 0,
  });
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [advice, setAdvice] = useState('');
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);

  const handleRatingChange = (category: string, value: number) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would send to backend
    onSubmit();
  };

  const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl">Review {influencerName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Categories */}
          <div>
            <h3 className="text-xl mb-4">Rate Your Experience</h3>
            <div className="space-y-4">
              {Object.entries(ratings).map(([category, rating]) => (
                <div key={category}>
                  <label className="block text-sm mb-2 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
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
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Overall Rating: <span className="text-xl">{overallRating.toFixed(1)}</span>
                  <Star className="w-4 h-4 inline text-yellow-400 ml-1" fill="currentColor" />
                </p>
              </div>
            )}
          </div>

          {/* Written Feedback */}
          <div>
            <label htmlFor="pros" className="block text-sm mb-2">
              What did you like about working with this influencer? *
            </label>
            <textarea
              id="pros"
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="e.g., Great communication, high engagement rates, hit and exceeded the given brief..."
            />
          </div>

          <div>
            <label htmlFor="cons" className="block text-sm mb-2">
              What could have been better? *
            </label>
            <textarea
              id="cons"
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="e.g., Response time could be faster, pricing was high, content didn't perform to expectations..."
            />
          </div>

          <div>
            <label htmlFor="advice" className="block text-sm mb-2">
              What advice would you give to brands considering this influencer? *
            </label>
            <textarea
              id="advice"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="e.g., Book in advance, give creative freedom, set clear expectations..."
            />
          </div>

          {/* Would Work Again */}
          <div>
            <label className="block text-sm mb-2">
              Would you work with this influencer again? *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWouldWorkAgain(true)}
                className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                  wouldWorkAgain === true
                    ? 'border-green-500 bg-green-50 text-green-700'
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
                    ? 'border-red-500 bg-red-50 text-red-700'
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
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={overallRating === 0 || wouldWorkAgain === null}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
