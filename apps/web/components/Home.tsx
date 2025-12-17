import { Star, Shield, Users, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'search' | 'profile') => void;
  isLoggedIn: boolean;
}

export function Home({ onNavigate, isLoggedIn }: HomeProps) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-blue-600" fill="currentColor" />
              <span className="text-xl">InfluencerInsight</span>
            </div>
            <div className="flex gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => onNavigate('search')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Reviews
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl mb-6">
                Transparent Reviews of Influencers by PR Professionals
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                The first platform where verified PR professionals can share honest, anonymous reviews about working with influencers. Make informed decisions backed by real experiences.
              </p>
              <button
                onClick={() => onNavigate('register')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW18ZW58MXx8fHwxNzY1NjgxMTc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Professional team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Why PR Professionals Trust InfluencerInsight</h2>
            <p className="text-xl text-gray-600">
              Make better partnership decisions with verified insights from your peers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl mb-3">Verified PR Professionals</h3>
              <p className="text-gray-600">
                All reviewers are verified to ensure authentic, credible reviews from real PR professionals.
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl mb-3">Anonymous Reviews</h3>
              <p className="text-gray-600">
                Share your honest experiences without fear. Your identity remains protected while helping the community make informed decisions.
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl mb-3">Comprehensive Insights</h3>
              <p className="text-gray-600">
                Review influencers across multiple dimensions: professionalism, communication, content quality, content performance, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl mb-3">Register & Verify</h3>
              <p className="text-gray-600">
                Sign up with your professional details. We verify your PR industry credentials.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl mb-3">Browse & Search</h3>
              <p className="text-gray-600">
                Search for influencers you've worked with or are considering for partnerships. Read reviews from verified professionals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl mb-3">Leave Reviews</h3>
              <p className="text-gray-600">
                Share your experiences anonymously. Help the community while maintaining your privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">
            Find out what public relations professionals are saying
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start making better influencer partnership decisions today
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Star className="w-6 h-6 text-blue-500" fill="currentColor" />
                <span>InfluencerInsight</span>
              </div>
              <p className="text-sm">
                Empowering PR professionals with transparent influencer reviews.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © 2024 InfluencerInsight. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
