import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { TranslationProvider } from './contexts/TranslationContext';
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

const Root = () => {
  const isNative = Capacitor.isNativePlatform();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isNative || isSmallScreen) {
    return (
      <ThemeProvider
        defaultTheme="system"
        storageKey="muajjin-theme"
        attribute="class">
        <TranslationProvider>
          <App />
        </TranslationProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="muajjin-theme"
      attribute="class">
      <TranslationProvider>
        <div className="flex min-h-dvh items-center justify-center bg-muted p-4">
          <div
            className="relative h-[852px] max-h-[95dvh] w-[393px] overflow-hidden rounded-[2.5rem] border-[8px] border-foreground/15 bg-background shadow-2xl"
            style={{ transform: 'translateZ(0)' }}>
            <div className="h-full overflow-y-auto">
              <App />
            </div>
          </div>
        </div>
      </TranslationProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);
