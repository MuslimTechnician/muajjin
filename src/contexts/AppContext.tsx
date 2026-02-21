import {
  createContext,
  useContext,
  useState,
  useEffect,
  FC,
  ReactNode,
  useCallback,
} from 'react';
import { UserSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';

export interface AppSettings extends UserSettings {
  onboardingComplete: boolean;
  homeSections?: HomeSection[];
}

export interface HomeSection {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

const defaultAppSettings: AppSettings = {
  ...DEFAULT_SETTINGS,
  onboardingComplete: false,
  homeSections: [
    { id: 'dateTime', name: 'Date & Time Header', visible: true, order: 0 },
    { id: 'currentSalat', name: 'Current Salat', visible: true, order: 1 },
    { id: 'nextSalat', name: 'Next Salat', visible: true, order: 2 },
    { id: 'salatTimes', name: 'Salat Times', visible: true, order: 3 },
    {
      id: 'prohibitedTimes',
      name: 'Prohibited Times',
      visible: true,
      order: 4,
    },
    { id: 'saumTimes', name: 'Saum Times', visible: true, order: 5 },
  ],
};

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const APP_SETTINGS_KEY = 'muajjin-settings';

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') {
      return defaultAppSettings;
    }

    // Legacy onboarding completion flag (pre-AppContext)
    const legacyOnboardingCompleted =
      localStorage.getItem('muajjin-onboarding-completed') === 'true';

    const saved = localStorage.getItem(APP_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultAppSettings,
          ...parsed,
          // Ensure onboardingComplete is true if legacy flag exists
          onboardingComplete:
            Boolean(parsed?.onboardingComplete) || legacyOnboardingCompleted,
        };
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
        return defaultAppSettings;
      }
    }

    // No saved settings yet: still respect legacy onboarding completion flag
    return {
      ...defaultAppSettings,
      onboardingComplete: legacyOnboardingCompleted,
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultAppSettings);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_SETTINGS_KEY);
      localStorage.removeItem('muajjin-onboarding-completed');
    }
  }, []);

  return (
    <AppContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
