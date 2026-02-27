import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UpdateChecker } from '@/features/update';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CapacitorApp } from './components/CapacitorApp';
import { RouteGuard } from './components/layout/RouteGuard';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import FinalSettingsPage from './pages/onboarding/FinalSettingsPage';
import LocationSetupPage from './pages/onboarding/LocationSetupPage';
import WelcomePage from './pages/onboarding/WelcomePage';
import AboutSettings from './pages/settings/AboutSettings';
import DisplaySettings from './pages/settings/DisplaySettings';
import FastingSettings from './pages/settings/FastingSettings';
import HijriSettings from './pages/settings/HijriSettings';
import PrayerTimesSettings from './pages/settings/PrayerTimesSettings';
import SettingsHome from './pages/settings/SettingsHome';
import TimeLocationSettings from './pages/settings/TimeLocationSettings';
import TranslationSettings from './pages/settings/TranslationSettings';
import UpcomingPrayerTimesPage from './pages/UpcomingPrayerTimesPage';

const queryClient = new QueryClient();

const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CapacitorApp>
            <ScrollToTopOnNavigate />
            <UpdateChecker />
            <Routes>
              {/* Onboarding routes - blocked after completion */}
              <Route
                path="/onboarding/welcome"
                element={
                  <RouteGuard requireOnboardingComplete={false} redirectTo="/">
                    <WelcomePage />
                  </RouteGuard>
                }
              />
              <Route
                path="/onboarding/location"
                element={
                  <RouteGuard requireOnboardingComplete={false} redirectTo="/">
                    <LocationSetupPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/onboarding/settings"
                element={
                  <RouteGuard requireOnboardingComplete={false} redirectTo="/">
                    <FinalSettingsPage />
                  </RouteGuard>
                }
              />

              {/* Home page routes - require onboarding completion */}
              <Route
                path="/"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <HomePage />
                  </RouteGuard>
                }>
                <Route index element={<Index />} />
              </Route>

              <Route
                path="/upcoming-prayer-times"
                element={<UpcomingPrayerTimesPage />}
              />

              {/* Settings routes - require onboarding completion */}
              <Route
                path="/settings"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <SettingsHome />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/prayer-times"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <PrayerTimesSettings />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/fasting"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <FastingSettings />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/hijri"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <HijriSettings />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/time-location"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <TimeLocationSettings />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/display"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <DisplaySettings />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/translations"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <TranslationSettings />
                  </RouteGuard>
                }
              />
              <Route
                path="/settings/about"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <AboutSettings />
                  </RouteGuard>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CapacitorApp>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
