import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { SearchInfluencers } from '@/components/SearchInfluencers';
import { RecentlyViewedInfluencers } from '@/components/RecentlyViewedInfluencers';

export default function ProfilePage() {

  // Use
    
  return (
    <main className="bg-gray-50 flex min-h-screen flex-col items-center">
      <NavBar />
      <RecentlyViewedInfluencers />
      <SearchInfluencers />
      <Footer />
    </main>
  );
}
