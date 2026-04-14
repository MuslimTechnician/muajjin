import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UpdateChecker } from '@/features/update-checker';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CapacitorApp } from './components/capacitor-app';
import { RouteGuard } from './components/layout/route-guard';
import { AppProvider } from './contexts/app-context';
import HomePage from './pages/home-page';
import HomeDashboardPage from './pages/index';
import NotFound from './pages/not-found';
import FinalSettingsPage from './pages/onboarding/final-settings-page';
import LocationSetupPage from './pages/onboarding/location-setup-page';
import WelcomePage from './pages/onboarding/welcome-page';
import QazaTrackerPage from './pages/qaza-tracker-page';
import QiblaCompassPage from './features/qibla-compass/qibla-compass-page';
import AboutSettings from './pages/settings/about-settings';
import DisplaySettings from './pages/settings/display-settings';
import FastingSettings from './pages/settings/fasting-settings';
import HijriSettings from './pages/settings/hijri-settings';
import PrayerTimesSettings from './pages/settings/prayer-times-settings';
import SettingsHome from './pages/settings/settings-home';
import TimeLocationSettings from './pages/settings/time-location-settings';
import TranslationSettings from './pages/settings/translation-settings';
import UpcomingPrayerTimesPage from './features/upcoming-prayer-times/upcoming-prayer-times-page';

const queryClient = new QueryClient();

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

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
                <Route index element={<HomeDashboardPage />} />
              </Route>

              <Route
                path="/upcoming-prayer-times"
                element={<UpcomingPrayerTimesPage />}
              />
              <Route
                path="/qibla"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <QiblaCompassPage />
                  </RouteGuard>
                }
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
                path="/qaza"
                element={
                  <RouteGuard
                    requireOnboardingComplete={true}
                    redirectTo="/onboarding/welcome">
                    <QazaTrackerPage />
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
