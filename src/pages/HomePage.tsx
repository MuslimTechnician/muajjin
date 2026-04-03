import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';

const HomePage = () => {
  return (
    <div className="min-h-screen pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default HomePage;
