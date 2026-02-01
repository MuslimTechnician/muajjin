import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';

export function CapacitorApp({ children }: { children: React.ReactNode }) {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only set up once
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    // Handle Android back button
    const setupBackButton = async () => {
      // Check if running in native app (Capacitor)
      const isNative = (window as any).Capacitor?.isNative;

      if (!isNative) {
        return; // Only set up in native app
      }

      // Listen for back button presses
      const handler = await App.addListener('backButton', async () => {
        // Check if we can go back in navigation history
        const canGoBack = window.history.length > 1;

        if (canGoBack) {
          // Navigate back in React Router
          window.history.back();
        } else {
          // At the root, exit the app
          App.exitApp();
        }
      });

      return handler;
    };

    const handlerPromise = setupBackButton();

    // Cleanup listener on unmount
    return () => {
      handlerPromise.then(handler => {
        if (handler) {
          handler.remove();
        }
      });
    };
  }, []);

  return <>{children}</>;
}
