import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import ChangePasswordForm from './ChangePasswordForm';

export default function ProfilePage() {

    // Use

    return (
        <main className="bg-gray-50 flex min-h-screen flex-col items-center">
            <NavBar />
            <div className="min-h-screen">
                <ChangePasswordForm />
            </div>
            <Footer />
        </main>
    );
}
