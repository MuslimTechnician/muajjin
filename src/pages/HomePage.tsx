
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* App Header - Always visible */}
      <AppHeader />

      {/* Main Content - Outlet renders child routes */}
      <Outlet />
    </div>
  );
};

export default HomePage;
