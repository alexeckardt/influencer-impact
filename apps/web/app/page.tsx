'use client';

import { Footer } from '@/components/Footer';
import { Home } from '@/components/Home';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/lib/auth-context';

export default function BasePage() {
  const { isLoggedIn } = useAuth();

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <Home />
      <Footer />
    </main>
  );
};
