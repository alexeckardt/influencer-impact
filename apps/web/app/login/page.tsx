import { Footer } from '@/components/Footer';
import { Login } from '@/components/Login';
import { NavBar } from '@/components/NavBar';

export default function LoginPage() {

  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <Login />
      <Footer />
    </main>
  );
}
