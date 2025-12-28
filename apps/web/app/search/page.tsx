'use client';
import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { SearchInfluencers } from '@/components/SearchInfluencers';

export default function ProfilePage() {

  // Use
    
  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <SearchInfluencers />
      <Footer />
    </main>
  );
}
