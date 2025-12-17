import { useState } from 'react';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { InfluencerProfile } from './components/InfluencerProfile';
import { SearchInfluencers } from './components/SearchInfluencers';

type Page = 'home' | 'login' | 'register' | 'search' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('search');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const handleViewProfile = (influencerId: string) => {
    setSelectedInfluencer(influencerId);
    setCurrentPage('profile');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} isLoggedIn={isLoggedIn} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'register':
        return <Register onNavigate={setCurrentPage} onRegister={handleLogin} />;
      case 'search':
        return <SearchInfluencers onNavigate={setCurrentPage} onViewProfile={handleViewProfile} onLogout={handleLogout} />;
      case 'profile':
        return <InfluencerProfile influencerId={selectedInfluencer} onNavigate={setCurrentPage} onBack={() => setCurrentPage('search')} onLogout={handleLogout} />;
      default:
        return <Home onNavigate={setCurrentPage} isLoggedIn={isLoggedIn} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderPage()}
    </div>
  );
}
