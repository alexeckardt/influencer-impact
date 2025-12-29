'use client';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { ReviewDetail } from '@/components/ReviewDetail';

export default function ReviewPage() {
  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <ReviewDetail />
      <Footer />
    </main>
  );
}
