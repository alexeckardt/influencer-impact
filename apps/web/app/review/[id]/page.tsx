'use client';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { ReviewForm } from '@/components/ReviewForm';

export default function ReviewPage() {

  // Use
    
  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <ReviewForm />
      <Footer />
    </main>
  );
}
