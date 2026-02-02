import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PrayerTime } from '@/types';
import { formatTime, getCurrentSalat, getNextSalat } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';
import { Clock } from 'lucide-react';

interface CurrentPrayerContainerProps {
  allPrayers: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function CurrentPrayerContainer({ allPrayers, timeFormat = 'system' }: CurrentPrayerContainerProps) {
  const { t } = useTranslation();
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [countdownLine, setCountdownLine] = useState<string>('');

  const parseTimeToDate = (time: string, baseDate: Date = new Date()): Date => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  // Recalculate current/next salat every 30 seconds and on mount
  useEffect(() => {
    const updatePrayerState = () => {
      if (allPrayers.length > 0) {
        setCurrentPrayer(getCurrentSalat(allPrayers));
        setNextPrayer(getNextSalat(allPrayers));
      }
    };

    // Update immediately on mount
    updatePrayerState();

    // Update every 30 seconds to catch salat transitions
    const timer = setInterval(updatePrayerState, 30000);

    return () => clearInterval(timer);
  }, [allPrayers]);

  // Update countdown and progress every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentPrayer) {
        const now = new Date();
        const startTime = parseTimeToDate(currentPrayer.start);
        const jamaahDateTime = currentPrayer.jamaah ? parseTimeToDate(currentPrayer.jamaah) : startTime;

        // For Isha, end time (Fajr) should be TOMORROW's date
        // Isha crosses midnight: starts today evening, ends tomorrow morning
        let endTime: Date;
        if (currentPrayer.end) {
          if (currentPrayer.id === 'isha') {
            // Isha ends at tomorrow's Fajr - calculate tomorrow's date and parse the time to it
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0); // Reset to midnight
            endTime = parseTimeToDate(currentPrayer.end, tomorrow);
          } else {
            // Other prayers use today's date
            endTime = parseTimeToDate(currentPrayer.end);
          }
        } else {
          endTime = nextPrayer ? parseTimeToDate(nextPrayer.start) : startTime;
        }

        // Handle day wraparound for Isha (Jama'ah times may cross midnight)
        if (currentPrayer.id === 'isha') {
          const startHour = startTime.getHours();
          const nowHour = now.getHours();

          if (nowHour >= startHour) {
            // Before midnight (e.g., 9:00 PM) - same day as Isha start
            // Check if Jama'ah time is after midnight (hour < start hour)
            const jamaahHour = jamaahDateTime.getHours();
            if (jamaahHour < startHour) {
              jamaahDateTime.setDate(jamaahDateTime.getDate() + 1);
            }
            // End time is already set to tomorrow above, no need to adjust
          } else {
            // After midnight / early morning (e.g., 3:00 AM) - before Isha start hour
            // Start time was yesterday
            startTime.setDate(startTime.getDate() - 1);

            // End time (tomorrow's Fajr) needs to be adjusted to today's Fajr
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            endTime = parseTimeToDate(currentPrayer.end!, today);

            // Check if Jama'ah has already passed
            const jamaahHour = jamaahDateTime.getHours();
            if (jamaahHour >= startHour || nowHour >= jamaahHour) {
              jamaahDateTime.setDate(jamaahDateTime.getDate() - 1);
            }
          }
        }

        // Determine if we're counting down to Jama'ah or End
        const timeUntilJamaah = jamaahDateTime.getTime() - now.getTime();

        let targetTime: Date;
        let totalTime: number;

        if (timeUntilJamaah > 0) {
          // Before Jama'ah time - countdown to Jama'ah
          targetTime = jamaahDateTime;
          totalTime = jamaahDateTime.getTime() - startTime.getTime();
        } else {
          // After Jama'ah time - countdown to End
          targetTime = endTime;
          // For progress bar, always use full prayer duration (start to end)
          // not just jamaah to end, for consistent 0-100% progress
          totalTime = endTime.getTime() - startTime.getTime();
        }

        // One translatable string (same pattern as all UI: single key with {{param}})
        const targetLabel = timeUntilJamaah > 0
          ? (currentPrayer.jamaah ? t('salatTimes.jamaah') : t('salatTimes.end'))
          : t('salatTimes.end');
        setCountdownLine(t('salatTimes.remainingToTarget', { target: targetLabel }));

        const remaining = targetTime.getTime() - now.getTime();
        const elapsed = now.getTime() - startTime.getTime();

        // Calculate progress percentage (from start to current target)
        const percent = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
        setProgressPercent(percent);

        // Format remaining time with seconds
        if (remaining < 0) {
          // Time passed
          const passedSeconds = Math.abs(Math.floor(remaining / 1000));
          const hours = Math.floor(passedSeconds / 3600);
          const minutes = Math.floor((passedSeconds % 3600) / 60);
          const seconds = passedSeconds % 60;
          setRemainingTime(`-${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        } else {
          // Time remaining
          const remainingSeconds = Math.floor(remaining / 1000);
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;
          setRemainingTime(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPrayer, nextPrayer, t]);

  if (!currentPrayer) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-primary uppercase">
              {currentPrayer.name}
            </h2>
            <p className="text-sm text-muted-foreground">{t('salatTimes.current')}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-2xl font-bold text-primary">
              <Clock className="w-5 h-5" />
              {remainingTime}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {countdownLine}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
            <Progress value={progressPercent} variant="glow" className="h-full" />
          </div>
        </div>

        {/* Times Grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentPrayer.jamaah && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">{t('salatTimes.jamaah')}</p>
              <p className="text-xl font-bold">
                {formatTime(currentPrayer.jamaah, timeFormat)}
              </p>
            </div>
          )}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">{t('salatTimes.end')}</p>
            <p className="text-xl font-bold">
              {currentPrayer.end ? formatTime(currentPrayer.end, timeFormat) : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
