import { useState } from 'react';
import { Star, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface RegisterProps {
  onRegister: () => void;
}

export function Register({ onRegister }: RegisterProps) {
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

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
      setError('Please provide a valid LinkedIn URL');
      return false;
    }
    
    return true;
  };

  const hashPassword = async (password: string): Promise<string> => {
    // Simple client-side hashing - in production, use proper password hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Hash the password (in production, this should be done server-side)
      const hashedPassword = await hashPassword(formData.password);
      
      // Insert into prospect_users table
      const { error } = await supabase
        .from('prospect_users')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: hashedPassword,
          company: formData.company || null,
          job_title: formData.jobTitle || null,
          years_experience: formData.yearsExperience || null,
          linkedin_url: formData.linkedinUrl || null,
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          setError('An account with this email already exists. Please use a different email or contact support.');
        } else {
          setError('Failed to submit application. Please try again.');
        }
        return;
      }

      setSubmitted(true);
      onRegister();
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl mb-4 text-gray-900">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application. Our team will review your information and contact you within 2-3 business days.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You'll receive an email confirmation once your account is approved.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Registration Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl mb-2 text-center">Apply for Access</h2>
            <p className="text-gray-600 text-center mb-8">
              Join verified PR professionals sharing insights
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

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
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="you@company.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use your professional email address</p>
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
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-xl mb-4 pb-2 border-b border-gray-200">Professional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="company" className="block text-sm mb-2">
                      Company/Organization
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Acme PR Agency"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm mb-2">
                        Job Title
                      </label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        placeholder="PR Manager"
                      />
                    </div>
                    <div>
                      <label htmlFor="yearsExperience" className="block text-sm mb-2">
                        Years of Experience
                      </label>
                      <select
                        id="yearsExperience"
                        name="yearsExperience"
                        value={formData.yearsExperience}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="">Select...</option>
                        <option value="0-1">0-1 years</option>
                        <option value="2-5">2-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="11-15">11-15 years</option>
                        <option value="15+">15+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="linkedinUrl" className="block text-sm mb-2">
                      LinkedIn Profile URL
                    </label>
                    <input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Help us verify your professional background
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-start gap-3 mb-6">
                  <input
                    type="checkbox"
                    required
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <span className="text-sm text-gray-600">
                    I confirm that the information provided is accurate and I understand that access 
                    is subject to manual review and approval by the platform administrators.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}