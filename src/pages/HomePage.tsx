
import { useState } from 'react';
import Index from './Index';
import SettingsPage from './Settings';
import { BottomNavBar } from '@/components/BottomNavBar';

// Define the available sections
export type Section = 'home' | 'settings';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState<Section>('home');

  return (
    <div className="min-h-screen">
      {/* Show components based on active section */}
      {activeSection === 'home' && <Index />}
      {activeSection === 'settings' && <SettingsPage />}

      {/* Bottom navigation bar that updates the active section */}
      <BottomNavBar activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
};

export default HomePage;
