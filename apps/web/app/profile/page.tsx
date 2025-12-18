'use client';
import { InfluencerProfile } from '@/components/InfluencerProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/Footer';

export default function ProfilePage() {

  // Use
  const router = useRouter();

  const handleBack = () => {
    router.push('./');
  }

  const handleLogout = () => {

  }

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center justify-between p-24">
      <InfluencerProfile
        influencerId={null}
        onBack={handleBack}
        onLogout={handleLogout}
      />
      <Footer />
    </main>
  );
}
