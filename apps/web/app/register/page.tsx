'use client';
import { InfluencerProfile } from '@/components/InfluencerProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Register } from '@/components/Register';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export default function ProfilePage() {

  // Use
  const router = useRouter();

  const handleRegister = () => {
    
  }

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <Register onRegister={handleRegister} />
      <Footer />
    </main>
  );
}
