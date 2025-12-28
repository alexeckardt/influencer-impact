'use client';
import { useState } from 'react';

export default function ChangePasswordForm() {
    console.log('ChangePasswordForm: Component rendering');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validatePassword = () => {

        // Clear
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }

        // All Good
        return true;
    }


    const handleReturnButton = () => {
        window.location.href = '/login';
    }

    const handleSubmit = async () => {
        console.log('ChangePasswordForm: handleSubmit called');

        // Ensure Valid Password
        if (!validatePassword()) {
            console.log('ChangePasswordForm: Password validation failed');
            return;
        }

        console.log('ChangePasswordForm: Making API request to /api/setup-account');

        try {
            const apiUrl = '/api/setup-account';
            console.log('ChangePasswordForm: Fetching URL:', apiUrl);
            console.log('ChangePasswordForm: Full URL:', window.location.origin + apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            console.log('ChangePasswordForm: API response status:', response.status);
            console.log('ChangePasswordForm: Response URL:', response.url);

            if (response.ok) {
                console.log('ChangePasswordForm: Password updated successfully');
                setSuccess(true);
                
                // Sign out on the client side to ensure clean state
                const { createClient } = await import('@/lib/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                
                // Redirect to login after a brief delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                const data = await response.json();
                console.error('ChangePasswordForm: API error:', data);
                setError(data.error || 'Failed to update account');
            }
        } catch (err) {
            console.error('ChangePasswordForm: Request failed:', err);
            setError('An unexpected error occurred');
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="mb-6">
                        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
                    <p className="text-gray-600 mb-6">
                        Your account has been set up successfully! Redirecting you to login...
                    </p>
                    <button 
                        onClick={handleReturnButton}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Go to Login Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Account</h1>
                    <p className="text-gray-600">Please create a new password to continue</p>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter your new password"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Confirm your new password"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <button 
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                        Update Password
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        <p>Password must be at least 8 characters long</p>
                    </div>
                </form>
            </div>
        </div>
    );
}