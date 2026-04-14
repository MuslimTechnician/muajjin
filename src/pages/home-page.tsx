import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/bottom-nav';

const HomePage: FC = () => {
  return (
    <div className="min-h-screen pb-16">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default HomePage;
