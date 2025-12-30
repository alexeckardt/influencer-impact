
import { Register } from '@/components/Register';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';

export default function ProfilePage() {

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <Register />
      <Footer />
    </main>
  );
}
