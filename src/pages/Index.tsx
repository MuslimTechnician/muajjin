import { CurrentPrayerContainer } from '@/components/CurrentPrayerContainer';
import { DateTimeContainer } from '@/components/DateTimeContainer';
import { FastingTimesContainer } from '@/components/FastingTimesContainer';
import { NextPrayerContainer } from '@/components/NextPrayerContainer';
import { PrayerTimesContainer } from '@/components/PrayerTimesContainer';
import { ProhibitedTimesContainer } from '@/components/ProhibitedTimesContainer';
import { DEFAULT_CONTAINER_ORDER } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';
import { calculatePrayerTimesLocally } from '@/services/prayerTimesLocal';
import { PrayerTime, ProhibitedTime, UserSettings } from '@/types';
import { EContainerType } from '@/types/enums';
import {
  adjustTime,
  getProhibitedTimes,
  setTranslationFunction,
} from '@/utils/timeUtils';
import { useApp } from '@/contexts/AppContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Migrate old settings property names and values to the current shape.
 * - Handles legacy "sehriAdjustment" → "suhoorAdjustment".
 * - Normalizes madhab values so Shafi = 0, Hanafi = 1.
 */
function migrateSettings(settings: UserSettings): Partial<UserSettings> {
  const migrated: Partial<UserSettings> = {};

  // Legacy sehriAdjustment → suhoorAdjustment
  if ((settings as any).sehriAdjustment !== undefined && settings.suhoorAdjustment === undefined) {
    migrated.suhoorAdjustment = (settings as any).sehriAdjustment;
  }

  // Normalize madhab: any legacy value 2 should become 0 (Shafi)
  if ((settings as any).madhab === 2) {
    migrated.madhab = 0;
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
  const { t, getSalatName, mounted } = useTranslation();
  const { settings, updateSettings } = useApp();
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

    const migrated = migrateSettings(settings);
    if (Object.keys(migrated).length > 0) {
      updateSettings(migrated);
    }
  }, [settings, updateSettings]);

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

    loadSalatTimes(settings);
    // Also reload prohibited times to ensure they're translated
    const timings = calculatePrayerTimesLocally(new Date(), settings);
    setProhibitedTimes(getProhibitedTimes(timings));
    setLoadedWithTranslation(true);
  }, [loadSalatTimes, loadedWithTranslation, mounted, t, settings]); // Reload when translation function changes or first mounted

  // Check for date change every minute and reload salat times at midnight
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toDateString();
      if (lastCalculatedDate && currentDate !== lastCalculatedDate) {
        loadSalatTimes(settings);
      }
    };

    // Check immediately
    checkDateChange();

    // Check every minute
    const timer = setInterval(checkDateChange, 60000);

    return () => clearInterval(timer);
  }, [lastCalculatedDate, loadSalatTimes, settings]);

  // Render containers based on user order
  const renderContainers = () => {
    return (
      <>
        {containerOrder.map((containerId, index) => {
          // Skip rendering if container is not visible
          if (!visibleContainers[containerId]) {
            return null;
          }

          switch (containerId) {
            case EContainerType.DateTime:
              return (
                <div key={containerId} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <DateTimeContainer
                    hijriAdjustment={settings.hijriAdjustment}
                    hijriDateChangeAtMaghrib={
                      settings.hijriDateChangeAtMaghrib
                    }
                    maghribTime={
                      salatTimes.find((p) => p.id === 'maghrib')?.start
                    }
                    location={{
                      city: settings.city || 'Dhaka',
                      country: '',
                    }}
                    timeFormat={settings.timeFormat}
                  />
                </div>
              );
            case EContainerType.CurrentSalat:
              return (
                <div key={containerId} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <CurrentPrayerContainer
                    allPrayers={salatTimes}
                    timeFormat={settings.timeFormat}
                  />
                </div>
              );
            case EContainerType.NextSalat:
              return (
                <div key={containerId} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <NextPrayerContainer
                    allPrayers={salatTimes}
                    timeFormat={settings.timeFormat}
                  />
                </div>
              );
            case EContainerType.SalatTimes:
              return (
                <div key={containerId} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <PrayerTimesContainer
                    salats={salatTimes}
                    timeFormat={settings.timeFormat}
                  />
                </div>
              );
            case EContainerType.ProhibitedTimes:
              return (
                <div key={containerId} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <ProhibitedTimesContainer
                    prohibitedTimes={prohibitedTimes}
                    timeFormat={settings.timeFormat}
                  />
                </div>
              );
            case EContainerType.SaumTimes:
              return (
                <div key={containerId} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <FastingTimesContainer
                    suhoorTime={suhoorTime}
                    iftarTime={iftarTime}
                    timeFormat={settings.timeFormat}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="mx-auto max-w-md px-5 py-6 space-y-6">
        {isLoading || !mounted ? (
          <div className="flex h-[60vh] flex-col items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-4 w-32 rounded bg-secondary" style={{ animationDelay: '150ms' }}></div>
              <div className="h-3 w-24 rounded bg-secondary" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : (
          renderContainers()
        )}
      </div>
    </div>
  );
};

export default Index;
