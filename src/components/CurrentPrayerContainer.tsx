import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrayerTime } from '@/types';
import { formatTime } from '@/utils/timeUtils';
import { getCurrentPrayer, getNextPrayer } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';

interface CurrentPrayerContainerProps {
  allPrayers: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

// Helper to get Jama'ah time with fallback to start time
const getJamaahTime = (prayer: PrayerTime): string => {
  return prayer.jamaah || prayer.start;
};

export function CurrentPrayerContainer({ allPrayers, timeFormat = 'system' }: CurrentPrayerContainerProps) {
  const { t } = useTranslation();
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [countdownLabel, setCountdownLabel] = useState<string>('Until Jama\'ah');
  const [countdownTarget, setCountdownTarget] = useState<string>('');

  useEffect(() => {
    if (allPrayers.length > 0) {
      setCurrentPrayer(getCurrentPrayer(allPrayers));
      setNextPrayer(getNextPrayer(allPrayers));
    }
  }, [allPrayers]);

  // Update countdown and progress every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentPrayer) {
        const now = new Date();
        const jamaahTime = getJamaahTime(currentPrayer);
        const [jamaahHours, jamaahMinutes] = jamaahTime.split(':').map(Number);
        const [startHours, startMinutes] = currentPrayer.start.split(':').map(Number);
        const [endHours, endMinutes] = (currentPrayer.end || nextPrayer?.start || currentPrayer.start).split(':').map(Number);

        const startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0, 0);

        const jamaahDateTime = new Date();
        jamaahDateTime.setHours(jamaahHours, jamaahMinutes, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0, 0);

        // Handle day wraparound for Isha
        if (currentPrayer.name === 'Isha') {
          if (now.getHours() >= startHours) {
            // Before midnight (e.g., 9:00 PM)
            // Check if Jama'ah time is after midnight (hour less than start hour)
            if (jamaahHours < startHours) {
              // Jama'ah is tomorrow (e.g., Isha at 7 PM, Jama'ah at 12:30 AM)
              jamaahDateTime.setDate(jamaahDateTime.getDate() + 1);
            }
            // End time (Fajr) is always tomorrow
            endTime.setDate(endTime.getDate() + 1);
          } else {
            // After midnight / early morning (e.g., 1:50 AM) - before Isha start hour
            // Start time was yesterday
            startTime.setDate(startTime.getDate() - 1);

            // Check if Jama'ah has already passed
            // Two cases where Jama'ah was yesterday:
            // 1. Jama'ah hour >= start hour (same day as Isha start, e.g., 7:45 PM)
            // 2. Jama'ah hour < start hour AND current hour >= Jama'ah hour (after midnight, already passed, e.g., 1:30 AM)
            if (jamaahHours >= startHours || now.getHours() >= jamaahHours) {
              // Jama'ah was yesterday (already passed)
              jamaahDateTime.setDate(jamaahDateTime.getDate() - 1);
            }
            // Otherwise: Jama'ah is still coming today (keep as is)
          }
        }

        // Determine if we're counting down to Jama'ah or End
        const timeUntilJamaah = jamaahDateTime.getTime() - now.getTime();
        const timeUntilEnd = endTime.getTime() - now.getTime();

        let targetTime: Date;
        let totalTime: number;

        if (timeUntilJamaah > 0) {
          // Before Jama'ah time - countdown to Jama'ah
          targetTime = jamaahDateTime;
          totalTime = jamaahDateTime.getTime() - startTime.getTime();
          setCountdownLabel(t('prayerTimes.untilJamaah'));
          setCountdownTarget(formatTime(jamaahTime, timeFormat));
        } else {
          // After Jama'ah time - countdown to End
          targetTime = endTime;
          totalTime = endTime.getTime() - jamaahDateTime.getTime();
          setCountdownLabel(t('prayerTimes.untilEnd'));
          setCountdownTarget(currentPrayer.end ? formatTime(currentPrayer.end, timeFormat) : 'N/A');
        }

        const remaining = targetTime.getTime() - now.getTime();
        const elapsed = now.getTime() - startTime.getTime();

        // Calculate progress percentage (from start to current target)
        const percent = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
        setProgressPercent(percent);

        // Format remaining time
        if (remaining < 0) {
          // Time passed
          const passedSeconds = Math.abs(Math.floor(remaining / 1000));
          const hours = Math.floor(passedSeconds / 3600);
          const minutes = Math.floor((passedSeconds % 3600) / 60);
          const seconds = passedSeconds % 60;
          setRemainingTime(`-${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        } else {
          // Time remaining
          const remainingSeconds = Math.floor(remaining / 1000);
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;
          setRemainingTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPrayer, nextPrayer, timeFormat]);

  if (!currentPrayer) {
    return null; // Hide card entirely when no current prayer
  }

  const jamaahTime = getJamaahTime(currentPrayer);

  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
          {t('prayerTimes.current')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Prayer Name */}
        <p className="text-2xl font-bold text-primary mb-3 text-center">{currentPrayer.name}</p>

        {/* Jama'ah | End - Boxed Style */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="border border-secondary rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">{t('prayerTimes.jamaah')}</p>
            <p className="text-2xl font-bold">{formatTime(jamaahTime, timeFormat)}</p>
          </div>
          <div className="border border-secondary rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">{t('prayerTimes.end')}</p>
            <p className="text-2xl font-bold">{currentPrayer.end ? formatTime(currentPrayer.end, timeFormat) : 'N/A'}</p>
          </div>
        </div>

        {/* Countdown - Boxed Style with Progress Bar Inside */}
        <div className="border border-secondary rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{countdownLabel}</p>
          <p className="text-3xl font-bold text-primary font-mono mb-3">{remainingTime}</p>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
