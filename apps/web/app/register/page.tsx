'use client';
import { InfluencerProfile } from '@/components/InfluencerProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Register } from '@/components/Register';

export default function ProfilePage() {

  // Use
  const router = useRouter();

  const handleRegister = () => {
    
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Register onRegister={handleRegister}
    />
    </main>
  );
}
