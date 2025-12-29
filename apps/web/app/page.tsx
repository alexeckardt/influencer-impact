import { Footer } from '@/components/Footer';
import { Home } from '@/components/Home';
import { NavBar } from '@/components/NavBar';

export default function BasePage() {
  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <Home />
      <Footer />
    </main>
  );
};
