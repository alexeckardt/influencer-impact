'use client';

import { useEffect, useState } from 'react';

export default function Home() {
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
