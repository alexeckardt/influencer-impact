'use client';
import { InfluencerProfile } from '@/components/InfluencerProfile';
import { Footer } from '@/components/Footer';
import { NavBar } from '@/components/NavBar';
import { use } from 'react';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // Unwrap the params Promise
  const { id } = use(params);

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center justify-between">
      <NavBar />
      <InfluencerProfile
        influencerId={id}
      />
      <Footer />
    </main>
  );
}
