'use client';

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";


export function NavBar() {
    const router = useRouter();
    const isLoggedIn = false; // Replace with actual authentication logic

    return (
        <nav className="border-b border-gray-200 bg-white w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <Star className="w-8 h-8 text-blue-600" fill="currentColor" />
                        <span className="text-xl">InfluencerInsight</span>
                    </button>

                    <div className="flex gap-3">
                        {isLoggedIn ? (
                            <button
                                onClick={() => router.push('/search')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Reviews
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
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
    )
};