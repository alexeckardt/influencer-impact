import { useEffect, useState } from 'react';

interface HomeProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'search' | 'profile') => void;
  isLoggedIn: boolean;
}

export function Home({ onNavigate, isLoggedIn }: HomeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Influencer Review Platform</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          A closed, authenticated platform for community-driven influencer reviews.
        </p>
        
        <div className="mt-8 flex gap-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('search')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Search Influencers
            </button>
          )}
        </div>
        
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2">
            <li>✓ Supabase Authentication</li>
            <li>✓ Influencer Profiles</li>
            <li>✓ Review Submission & Display</li>
            <li>✓ Meilisearch Integration</li>
            <li>✓ Background Job Processing</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Environment Setup</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure your .env.local file with Supabase credentials to get started.
          </p>
        </section>
      </div>
    </main>
  );
}