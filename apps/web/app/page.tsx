'use client';

import { Footer } from '@/components/Footer';
import { Home } from '@/components/Home';
import { NavBar } from '@/components/NavBar';
import { useEffect, useState } from 'react';

export default function BasePage() {

  const isLoggedIn = false; // Placeholder for authentication state

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <Home />
      <Footer />
    </main>
  );
};
