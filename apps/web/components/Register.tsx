import { useState } from 'react';
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface RegisterProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'search' | 'profile') => void;
  onRegister: () => void;
}

export function Register({ onNavigate, onRegister }: RegisterProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    jobTitle: '',
    yearsExperience: '',
    linkedinUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration - in real app would send to backend for verification
    onRegister();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Star className="w-8 h-8 text-blue-600" fill="currentColor" />
              <span className="text-xl">InfluencerInsight</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Registration Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl mb-2 text-center">Create Your Account</h2>
            <p className="text-gray-600 text-center mb-8">
              Join verified PR professionals sharing insights
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl mb-4 pb-2 border-b border-gray-200">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div>
                <h3 className="text-xl mb-4 pb-2 border-b border-gray-200">Account Credentials</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2">
                      Work Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm mb-2">
                        Password *
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm mb-2">
                        Confirm Password *
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Verification */}
              <div>
                <h3 className="text-xl mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  Professional Verification
                  <span className="text-sm text-gray-500">(Required for account approval)</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm mb-2">
                        Current Company *
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Acme PR Agency"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm mb-2">
                        Job Title *
                      </label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Senior PR Manager"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="yearsExperience" className="block text-sm mb-2">
                      Years of PR Experience *
                    </label>
                    <select
                      id="yearsExperience"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select experience level</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="linkedinUrl" className="block text-sm mb-2">
                      LinkedIn Profile URL *
                    </label>
                    <input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      We'll verify your employment and PR experience through your LinkedIn profile
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      <span className="text-blue-900">Verification Process:</span> Our team will review your LinkedIn profile and professional information within 24-48 hours. You'll receive an email once your account is approved.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Application
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 hover:text-blue-700"
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
