import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useTheme } from 'next-themes';
import { Capacitor } from '@capacitor/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { StatusBar, Style } from '@capacitor/status-bar';

export function CapacitorApp({ children }: { children: React.ReactNode }) {
  const isInitializedRef = useRef(false);
  const { theme, resolvedTheme } = useTheme();

  // Handle status bar color based on theme (Android only)
  useEffect(() => {
    const updateStatusBarColor = async () => {
      // Only run on native Android
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        return;
      }

      // Determine current theme (resolves "system" to "light" or "dark")
      const currentTheme = theme === 'system' ? resolvedTheme : theme;

      // Set status bar color based on theme
      const color = currentTheme === 'dark' ? '#1d283a' : '#ffffff';
      const style = currentTheme === 'dark' ? Style.Dark : Style.Light;

      try {
        await EdgeToEdge.setBackgroundColor({ color });
        await StatusBar.setStyle({ style });
      } catch (error) {
        console.error('Failed to set status bar color/style:', error);
      }
    };

    updateStatusBarColor();
  }, [theme, resolvedTheme]);

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
