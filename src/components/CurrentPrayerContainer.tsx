import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/contexts/TranslationContext';
import { PrayerTime, ProhibitedTime } from '@/types';
import {
  adjustTime,
  formatTime,
  getCurrentSalat,
  getNextSalat,
} from '@/utils/timeUtils';
import { Clock } from 'lucide-react';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface CurrentPrayerContainerProps {
  allPrayers: PrayerTime[];
  prohibitedTimes?: ProhibitedTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function CurrentPrayerContainer({
  allPrayers,
  prohibitedTimes = [],
  timeFormat = 'system',
}: CurrentPrayerContainerProps) {
  const { t } = useTranslation();
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [metrics, setMetrics] = useState<{
    remainingTime: string;
    progressPercent: number;
    countdownLine: string;
    isProhibited: boolean;
  }>({
    remainingTime: '',
    progressPercent: 0,
    countdownLine: '',
    isProhibited: false,
  });
  const [isUiReady, setIsUiReady] = useState(false);
  const isUiReadyRef = useRef(false);

  const parseTimeToDate = (time: string, baseDate: Date = new Date()): Date => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const isTimeInRange = useCallback((now: Date, start: string, end: string) => {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (endMinutes < startMinutes) {
      return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    }
    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  }, []);

  const isSamePrayer = (a: PrayerTime | null, b: PrayerTime | null) => {
    if (!a || !b) return a === b;
    return (
      a.id === b.id &&
      a.start === b.start &&
      a.end === b.end &&
      a.jamaah === b.jamaah
    );
  };

  const updatePrayerState = useCallback(() => {
    if (allPrayers.length > 0) {
      const nextCurrent = getCurrentSalat(allPrayers);
      const nextNext = getNextSalat(allPrayers);
      setCurrentPrayer((prev) =>
        isSamePrayer(prev, nextCurrent) ? prev : nextCurrent,
      );
      setNextPrayer((prev) => (isSamePrayer(prev, nextNext) ? prev : nextNext));
    }
  }, [allPrayers]);

  const derivedProhibitedTimes = useMemo<ProhibitedTime[]>(() => {
    if (allPrayers.length === 0) return [];
    const fajr = allPrayers.find((p) => p.id === 'fajr');
    const dhuhr = allPrayers.find((p) => p.id === 'dhuhr');
    const maghrib = allPrayers.find((p) => p.id === 'maghrib');

    if (!fajr?.end || !dhuhr?.start || !maghrib?.start) return [];

    return [
      {
        name: 'shuruq',
        start: fajr.end,
        end: adjustTime(fajr.end, 15),
      },
      {
        name: 'zawal',
        start: adjustTime(dhuhr.start, -15),
        end: dhuhr.start,
      },
      {
        name: 'ghurub',
        start: adjustTime(maghrib.start, -5),
        end: maghrib.start,
      },
    ];
  }, [allPrayers]);

  const effectiveProhibitedTimes =
    prohibitedTimes.length > 0 ? prohibitedTimes : derivedProhibitedTimes;

  // Recalculate current/next salat every 30 seconds and on mount
  useEffect(() => {
    // Update immediately on mount
    updatePrayerState();

    // Update every 30 seconds to catch salat transitions
    const timer = setInterval(updatePrayerState, 30000);

    return () => clearInterval(timer);
  }, [updatePrayerState]);

  const computeMetrics = useCallback(() => {
    if (!currentPrayer) return;

    const now = new Date();
    const startTime = parseTimeToDate(currentPrayer.start);
    const jamaahDateTime = currentPrayer.jamaah
      ? parseTimeToDate(currentPrayer.jamaah)
      : startTime;

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
    const targetLabel =
      timeUntilJamaah > 0
        ? currentPrayer.jamaah
          ? t('salatTimes.jamaah')
          : t('salatTimes.end')
        : t('salatTimes.end');
    const countdownLine = t('salatTimes.remainingToTarget', {
      target: targetLabel,
    });

    const remaining = targetTime.getTime() - now.getTime();
    const elapsed = now.getTime() - startTime.getTime();

    // Calculate progress percentage (from start to current target)
    const progressPercent = Math.min(
      100,
      Math.max(0, (elapsed / totalTime) * 100),
    );

    // Format remaining time with seconds
    let remainingTime: string;
    if (remaining < 0) {
      // Transition window: move to next prayer immediately
      if (nextPrayer) {
        updatePrayerState();
        return;
      }
      // Time passed
      const passedSeconds = Math.abs(Math.floor(remaining / 1000));
      const hours = Math.floor(passedSeconds / 3600);
      const minutes = Math.floor((passedSeconds % 3600) / 60);
      const seconds = passedSeconds % 60;
      remainingTime = `-${hours < 1 ? '' : `${hours}:`}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      // Time remaining
      const remainingSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      remainingTime = `${hours < 1 ? '' : `${hours}:`}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    const isProhibited = effectiveProhibitedTimes.some((time) =>
      isTimeInRange(now, time.start, time.end),
    );

    setMetrics((prev) => {
      if (
        prev.remainingTime === remainingTime &&
        prev.progressPercent === progressPercent &&
        prev.countdownLine === countdownLine &&
        prev.isProhibited === isProhibited
      ) {
        return prev;
      }
      return { remainingTime, progressPercent, countdownLine, isProhibited };
    });

    if (!isUiReadyRef.current) {
      isUiReadyRef.current = true;
      setIsUiReady(true);
    }
  }, [
    currentPrayer,
    isTimeInRange,
    nextPrayer,
    effectiveProhibitedTimes,
    t,
    updatePrayerState,
  ]);

  // Reset UI readiness when current prayer changes
  useEffect(() => {
    if (!currentPrayer) return;
    isUiReadyRef.current = false;
    setIsUiReady(false);
    computeMetrics();
  }, [currentPrayer, computeMetrics]);

  // Update countdown and progress every second
  useEffect(() => {
    if (!currentPrayer) return;
    const timer = setInterval(() => {
      computeMetrics();
    }, 1000);

    return () => clearInterval(timer);
  }, [computeMetrics, currentPrayer]);

  if (!currentPrayer) {
    return null;
  }

  return (
    <Card className="relative shadow-lg">
      <CardContent className="space-y-4 p-6">
        {!isUiReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-primary">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm font-medium">{t('common.loading')}</span>
            </div>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h2 className="text-3xl font-bold uppercase text-primary">
              {currentPrayer.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('salatTimes.current')}
            </p>
          </div>

          <div className="text-right">
            {!currentPrayer.jamaah ? (
              <div className="gap-2 text-2xl font-bold text-primary">
                {currentPrayer.end
                  ? formatTime(currentPrayer.end, timeFormat)
                  : 'N/A'}
                <p className="text-xs text-muted-foreground">
                  {t('salatTimes.end')}
                </p>
              </div>
            ) : (
              <Fragment>
                <div className="flex items-center justify-end gap-2 text-2xl font-bold text-primary">
                  <Clock className="h-5 w-5" />
                  {metrics.remainingTime}
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {metrics.countdownLine}
                </p>
              </Fragment>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <Progress
              value={metrics.progressPercent}
              // variant={metrics.isProhibited ? 'danger' : 'glow'}
              className="h-full"
            />
          </div>
        </div>

        {/* Times Grid */}
        <div className="grid grid-cols-2 gap-3">
          {currentPrayer.jamaah ? (
            <Fragment>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  {t('salatTimes.jamaah')}
                </p>
                <p className="text-xl font-bold">
                  {formatTime(currentPrayer.jamaah, timeFormat)}
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">
                  {t('salatTimes.end')}
                </p>

                <p className="text-xl font-bold">
                  {currentPrayer.end
                    ? formatTime(currentPrayer.end, timeFormat)
                    : 'N/A'}
                </p>
              </div>
            </Fragment>
          ) : (
            <div className="col-span-2">
              <p className="mb-2 flex items-center justify-center gap-2 text-xl font-bold text-primary">
                <Clock className="h-5 w-5" />
                {metrics.remainingTime}
              </p>

              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {metrics.countdownLine}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
