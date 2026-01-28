
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import SettingsHome from "./pages/settings/SettingsHome";
import PrayerTimesSettings from "./pages/settings/PrayerTimesSettings";
import FastingSettings from "./pages/settings/FastingSettings";
import HijriSettings from "./pages/settings/HijriSettings";
import TimeLocationSettings from "./pages/settings/TimeLocationSettings";
import DisplaySettings from "./pages/settings/DisplaySettings";
import TranslationSettings from "./pages/settings/TranslationSettings";
import AboutSettings from "./pages/settings/AboutSettings";
import WelcomePage from "./pages/onboarding/WelcomePage";
import LocationSetupPage from "./pages/onboarding/LocationSetupPage";
import FinalSettingsPage from "./pages/onboarding/FinalSettingsPage";
import NotFound from "./pages/NotFound";
import { CapacitorApp } from "./components/CapacitorApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CapacitorApp>
          <Routes>
          {/* Onboarding routes - separate layout without AppHeader */}
          <Route path="/onboarding/welcome" element={<WelcomePage />} />
          <Route path="/onboarding/location" element={<LocationSetupPage />} />
          <Route path="/onboarding/settings" element={<FinalSettingsPage />} />

          {/* Home page routes */}
          <Route path="/" element={<HomePage />}>
            <Route index element={<Index />} />
          </Route>

          {/* Settings routes - separate layout without AppHeader */}
          <Route path="/settings" element={<SettingsHome />} />
          <Route path="/settings/prayer-times" element={<PrayerTimesSettings />} />
          <Route path="/settings/fasting" element={<FastingSettings />} />
          <Route path="/settings/hijri" element={<HijriSettings />} />
          <Route path="/settings/time-location" element={<TimeLocationSettings />} />
          <Route path="/settings/display" element={<DisplaySettings />} />
          <Route path="/settings/translations" element={<TranslationSettings />} />
          <Route path="/settings/about" element={<AboutSettings />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </CapacitorApp>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
