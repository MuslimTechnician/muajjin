import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { DateTimeContainer } from '@/components/DateTimeContainer';
import { CurrentPrayerContainer } from '@/components/CurrentPrayerContainer';
import { NextPrayerContainer } from '@/components/NextPrayerContainer';
import { PrayerTimesContainer } from '@/components/PrayerTimesContainer';
import { ProhibitedTimesContainer } from '@/components/ProhibitedTimesContainer';
import { FastingTimesContainer } from '@/components/FastingTimesContainer';
import { calculatePrayerTimesLocally } from '@/services/prayerTimesLocal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PrayerTime, ProhibitedTime, UserSettings } from '@/types';
import { adjustTime, getProhibitedTimes } from '@/utils/timeUtils';
import { DEFAULT_SETTINGS, DEFAULT_CONTAINER_ORDER } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

// Default visible containers - all visible by default
const defaultVisibleContainers: Record<string, boolean> = {
  [ContainerType.DateTime]: true,
  [ContainerType.CurrentPrayer]: true,
  [ContainerType.NextPrayer]: true,
  [ContainerType.PrayerTimes]: true,
  [ContainerType.ProhibitedTimes]: true,
  [ContainerType.FastingTimes]: true
};

// Container IDs for drag and drop
export enum ContainerType {
  DateTime = 'dateTime',
  CurrentPrayer = 'currentPrayer',
  NextPrayer = 'nextPrayer',
  PrayerTimes = 'prayerTimes',
  ProhibitedTimes = 'prohibitedTimes',
  FastingTimes = 'fastingTimes'
}

const Index = () => {
  const navigate = useNavigate();
  const { getPrayerName } = useTranslation();
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [containerOrder, setContainerOrder] = useLocalStorage<string[]>('muajjin-container-order', DEFAULT_CONTAINER_ORDER);
  const [visibleContainers] = useLocalStorage<Record<string, boolean>>('muajjin-visible-containers', defaultVisibleContainers);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [prohibitedTimes, setProhibitedTimes] = useState<ProhibitedTime[]>([]);
  const [sehriTime, setSehriTime] = useState<string>('');
  const [iftarTime, setIftarTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if onboarding is completed
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('muajjin-onboarding-completed');
    if (!onboardingCompleted) {
      navigate('/onboarding/welcome');
    }
  }, [navigate]);

  // Load prayer times on component mount
  useEffect(() => {
    loadPrayerTimes(userSettings);
  }, []);

  const loadPrayerTimes = (settings: UserSettings) => {
    setIsLoading(true);

    // Calculate prayer times locally using adhan library (no API call!)
    const timings = calculatePrayerTimesLocally(new Date(), settings);

    // Create prayer times array with jamaah times from settings
    const prayers: PrayerTime[] = [
      { name: getPrayerName('Fajr'), start: timings.Fajr, end: timings.Sunrise, jamaah: settings.jamaahTimes.Fajr },
      { name: getPrayerName('Dhuhr'), start: timings.Dhuhr, end: timings.Asr, jamaah: settings.jamaahTimes.Dhuhr },
      { name: getPrayerName('Asr'), start: timings.Asr, end: timings.Maghrib, jamaah: settings.jamaahTimes.Asr },
      { name: getPrayerName('Maghrib'), start: timings.Maghrib, end: timings.Isha, jamaah: settings.jamaahTimes.Maghrib },
      { name: getPrayerName('Isha'), start: timings.Isha, end: timings.Fajr, jamaah: settings.jamaahTimes.Isha }
    ];

    setPrayerTimes(prayers);

    // Set prohibited times
    setProhibitedTimes(getProhibitedTimes(timings));

    // Set fasting times with adjustments
    setSehriTime(adjustTime(timings.Fajr, settings.sehriAdjustment));
    setIftarTime(adjustTime(timings.Maghrib, settings.iftarAdjustment));

    setIsLoading(false);
  };
  
  // Render containers based on user order
  const renderContainers = () => {
    return (
      <>
        {containerOrder.map(containerId => {
          // Skip rendering if container is not visible
          if (!visibleContainers[containerId]) {
            return null;
          }

          switch (containerId) {
            case ContainerType.DateTime:
              return (
                <DateTimeContainer
                  key={containerId}
                  hijriAdjustment={userSettings.hijriAdjustment}
                  location={{
                    city: userSettings.city || 'Dhaka',
                    country: '' // Not used anymore, only showing city
                  }}
                  timeFormat={userSettings.timeFormat}
                />
              );
            case ContainerType.CurrentPrayer:
              return (
                <CurrentPrayerContainer key={containerId} allPrayers={prayerTimes} timeFormat={userSettings.timeFormat} />
              );
            case ContainerType.NextPrayer:
              return (
                <NextPrayerContainer key={containerId} allPrayers={prayerTimes} timeFormat={userSettings.timeFormat} />
              );
            case ContainerType.PrayerTimes:
              return (
                <PrayerTimesContainer key={containerId} prayers={prayerTimes} timeFormat={userSettings.timeFormat} />
              );
            case ContainerType.ProhibitedTimes:
              return (
                <ProhibitedTimesContainer key={containerId} prohibitedTimes={prohibitedTimes} timeFormat={userSettings.timeFormat} />
              );
            case ContainerType.FastingTimes:
              return (
                <FastingTimesContainer
                  key={containerId}
                  sehriTime={sehriTime}
                  iftarTime={iftarTime}
                  sehriAdjustment={userSettings.sehriAdjustment}
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
    <div className="min-h-screen p-4 max-w-md mx-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary"></div>
            <div className="h-4 w-32 bg-secondary rounded"></div>
            <div className="h-3 w-24 bg-secondary rounded"></div>
          </div>
        </div>
      ) : (
        renderContainers()
      )}
    </div>
  );
};

export default Index;
