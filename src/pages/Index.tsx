import { CurrentPrayerContainer } from '@/components/CurrentPrayerContainer';
import { DateTimeContainer } from '@/components/DateTimeContainer';
import { FastingTimesContainer } from '@/components/FastingTimesContainer';
import { NextPrayerContainer } from '@/components/NextPrayerContainer';
import { PrayerTimesContainer } from '@/components/PrayerTimesContainer';
import { ProhibitedTimesContainer } from '@/components/ProhibitedTimesContainer';
import {
  DEFAULT_CONTAINER_ORDER,
  DEFAULT_SETTINGS,
} from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculatePrayerTimesLocally } from '@/services/prayerTimesLocal';
import { PrayerTime, ProhibitedTime, UserSettings } from '@/types';
import { EContainerType } from '@/types/enums';
import {
  adjustTime,
  getProhibitedTimes,
  setTranslationFunction,
} from '@/utils/timeUtils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Migrate old settings property names to new ones
 * This handles the transition from legacy "prayer"/"sehri" to proper Arabic "salat"/"suhoor"
 */
function migrateSettings(settings: UserSettings): UserSettings {
  const migrated = { ...settings };

  // Migrate from legacy sehriAdjustment → suhoorAdjustment
  if ('sehriAdjustment' in settings && !('suhoorAdjustment' in settings)) {
    (migrated as any).suhoorAdjustment = (settings as any).sehriAdjustment;
    delete (migrated as any).sehriAdjustment;
  }

  return migrated;
}

// Default visible containers - all visible by default
const defaultVisibleContainers: Record<string, boolean> = {
  [EContainerType.DateTime]: true,
  [EContainerType.CurrentSalat]: true,
  [EContainerType.NextSalat]: true,
  [EContainerType.SalatTimes]: true,
  [EContainerType.ProhibitedTimes]: true,
  [EContainerType.SaumTimes]: true,
};

const Index = () => {
  const navigate = useNavigate();
  const { t, getSalatName, mounted } = useTranslation();
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>(
    'muajjin-settings',
    DEFAULT_SETTINGS,
  );
  const [containerOrder, setContainerOrder] = useLocalStorage<string[]>(
    'muajjin-container-order',
    DEFAULT_CONTAINER_ORDER,
  );
  const [visibleContainers] = useLocalStorage<Record<string, boolean>>(
    'muajjin-visible-containers',
    defaultVisibleContainers,
  );
  const [salatTimes, setSalatTimes] = useState<PrayerTime[]>([]);
  const [prohibitedTimes, setProhibitedTimes] = useState<ProhibitedTime[]>([]);
  const [suhoorTime, setSuhoorTime] = useState<string>('');
  const [iftarTime, setIftarTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadedWithTranslation, setLoadedWithTranslation] = useState(false);
  const [lastCalculatedDate, setLastCalculatedDate] = useState<string>('');
  const hasMigratedRef = useRef(false);

  // Migrate old settings property names (one-time migration)
  useEffect(() => {
    // Only run once
    if (hasMigratedRef.current) return;
    hasMigratedRef.current = true;

    const migrated = migrateSettings(userSettings);
    if (JSON.stringify(migrated) !== JSON.stringify(userSettings)) {
      setUserSettings(migrated);
    }
  }, [setUserSettings, userSettings]);

  // Check if onboarding is completed
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(
      'muajjin-onboarding-completed',
    );
    if (!onboardingCompleted) {
      navigate('/onboarding/welcome', { replace: true });
    }
  }, [navigate]);

  const loadSalatTimes = useCallback((settings: UserSettings) => {
    setIsLoading(true);

    // Calculate salat times locally using adhan library (no API call!)
    const timings = calculatePrayerTimesLocally(new Date(), settings);

    // Create salat times array with jamaah times from settings
    const salats: PrayerTime[] = [
      {
        id: 'fajr',
        name: getSalatName('Fajr'),
        start: timings.Fajr,
        end: timings.Shuruq,
        jamaah: settings.jamaahTimes.Fajr,
      },
      {
        id: 'dhuhr',
        name: getSalatName('Dhuhr'),
        start: timings.Dhuhr,
        end: timings.Asr,
        jamaah: settings.jamaahTimes.Dhuhr,
      },
      {
        id: 'asr',
        name: getSalatName('Asr'),
        start: timings.Asr,
        end: timings.Maghrib,
        jamaah: settings.jamaahTimes.Asr,
      },
      {
        id: 'maghrib',
        name: getSalatName('Maghrib'),
        start: timings.Maghrib,
        end: timings.Isha,
        jamaah: settings.jamaahTimes.Maghrib,
      },
      {
        id: 'isha',
        name: getSalatName('Isha'),
        start: timings.Isha,
        end: timings.Fajr,
        jamaah: settings.jamaahTimes.Isha,
      },
    ];

    setSalatTimes(salats);
    setSuhoorTime(adjustTime(timings.Fajr, settings.suhoorAdjustment));
    setIftarTime(adjustTime(timings.Maghrib, settings.iftarAdjustment));
    setLastCalculatedDate(new Date().toDateString());

    setIsLoading(false);
  }, [getSalatName]); // getSalatName changes with translations, so recreate when it changes

  // Load salat times on component mount and when translation changes
  useEffect(() => {
    // Only load after translations are mounted
    if (!mounted) return;

    // Initialize the translation function for timeUtils (use general 't', not 'getSalatName')
    setTranslationFunction(t);

    // If already loaded with this translation, don't reload
    if (loadedWithTranslation) return;

    loadSalatTimes(userSettings);
    // Also reload prohibited times to ensure they're translated
    const timings = calculatePrayerTimesLocally(new Date(), userSettings);
    setProhibitedTimes(getProhibitedTimes(timings));
    setLoadedWithTranslation(true);
  }, [loadSalatTimes, loadedWithTranslation, mounted, t, userSettings]); // Reload when translation function changes or first mounted

  // Check for date change every minute and reload salat times at midnight
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (lastCalculatedDate && currentDate !== lastCalculatedDate) {
        loadSalatTimes(userSettings);
      }
    };

    // Check immediately
    checkDateChange();

    // Check every minute
    const timer = setInterval(checkDateChange, 60000);

    return () => clearInterval(timer);
  }, [lastCalculatedDate, loadSalatTimes, userSettings]);

  // Render containers based on user order
  const renderContainers = () => {
    return (
      <>
        {containerOrder.map((containerId) => {
          // Skip rendering if container is not visible
          if (!visibleContainers[containerId]) {
            return null;
          }

          switch (containerId) {
            case EContainerType.DateTime:
              return (
                <DateTimeContainer
                  key={containerId}
                  hijriAdjustment={userSettings.hijriAdjustment}
                  hijriDateChangeAtMaghrib={
                    userSettings.hijriDateChangeAtMaghrib
                  }
                  maghribTime={
                    salatTimes.find((p) => p.id === 'maghrib')?.start
                  }
                  location={{
                    city: userSettings.city || 'Dhaka',
                    country: '', // Not used anymore, only showing city
                  }}
                  timeFormat={userSettings.timeFormat}
                />
              );
            case EContainerType.CurrentSalat:
              return (
                <CurrentPrayerContainer
                  key={containerId}
                  allPrayers={salatTimes}
                  timeFormat={userSettings.timeFormat}
                />
              );
            case EContainerType.NextSalat:
              return (
                <NextPrayerContainer
                  key={containerId}
                  allPrayers={salatTimes}
                  timeFormat={userSettings.timeFormat}
                />
              );
            case EContainerType.SalatTimes:
              return (
                <PrayerTimesContainer
                  key={containerId}
                  salats={salatTimes}
                  timeFormat={userSettings.timeFormat}
                />
              );
            case EContainerType.ProhibitedTimes:
              return (
                <ProhibitedTimesContainer
                  key={containerId}
                  prohibitedTimes={prohibitedTimes}
                  timeFormat={userSettings.timeFormat}
                />
              );
            case EContainerType.SaumTimes:
              return (
                <FastingTimesContainer
                  key={containerId}
                  suhoorTime={suhoorTime}
                  iftarTime={iftarTime}
                  suhoorAdjustment={userSettings.suhoorAdjustment}
                  iftarAdjustment={userSettings.iftarAdjustment}
                  timeFormat={userSettings.timeFormat}
                />
              );
            default:
              return null;
          }
        })}
      </>
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-md p-4">
      {isLoading || !mounted ? (
        <div className="flex h-[60vh] flex-col items-center justify-center">
          <div className="flex animate-pulse flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary"></div>
            <div className="h-4 w-32 rounded bg-secondary"></div>
            <div className="h-3 w-24 rounded bg-secondary"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {renderContainers()}
        </div>
      )}
    </div>
  );
};

export default Index;
