import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { PrayerTime } from '@/types';
import { formatTime, getCurrentSalat, getNextSalat } from '@/utils/timeUtils';
import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NextPrayerContainerProps {
  allPrayers: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function NextPrayerContainer({
  allPrayers,
  timeFormat = 'system',
}: NextPrayerContainerProps) {
  const { t } = useTranslation();
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSamePrayer = (a: PrayerTime | null, b: PrayerTime | null) => {
    if (!a || !b) return a === b;
    return (
      a.id === b.id &&
      a.start === b.start &&
      a.end === b.end &&
      a.jamaah === b.jamaah
    );
  };

  const getNextAfterCurrent = useCallback(
    (current: PrayerTime | null) => {
      if (!current || allPrayers.length === 0) return null;
      const sortedSalats = [...allPrayers].sort((a, b) => {
        const [aHours, aMinutes] = a.start.split(':').map(Number);
        const [bHours, bMinutes] = b.start.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      });

      const currentIndex = sortedSalats.findIndex((s) => s.id === current.id);
      if (currentIndex === -1) return null;
      return sortedSalats[(currentIndex + 1) % sortedSalats.length];
    },
    [allPrayers],
  );

  const updateNextPrayer = useCallback(() => {
    if (allPrayers.length > 0) {
      const current = getCurrentSalat(allPrayers);
      const nextFromCurrent = getNextAfterCurrent(current);
      const next = nextFromCurrent || getNextSalat(allPrayers);
      setNextPrayer((prev) => (isSamePrayer(prev, next) ? prev : next));
    }
  }, [allPrayers, getNextAfterCurrent]);

  const parseTimeToDate = (time: string, baseDate: Date = new Date()): Date => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };

  const scheduleNextUpdate = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (allPrayers.length === 0) return;

    const now = new Date();
    const sortedSalats = [...allPrayers].sort((a, b) => {
      const [aHours, aMinutes] = a.start.split(':').map(Number);
      const [bHours, bMinutes] = b.start.split(':').map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });

    let nextStart: Date | null = null;
    for (const salat of sortedSalats) {
      const start = parseTimeToDate(salat.start, now);
      if (start.getTime() > now.getTime()) {
        nextStart = start;
        break;
      }
    }

    if (!nextStart) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      nextStart = parseTimeToDate(sortedSalats[0].start, tomorrow);
    }

    const delayMs = Math.max(250, nextStart.getTime() - now.getTime() + 250);
    timerRef.current = setTimeout(() => {
      updateNextPrayer();
      scheduleNextUpdate();
    }, delayMs);
  }, [allPrayers, updateNextPrayer]);

  // Recalculate next salat on mount and schedule updates at exact transitions
  useEffect(() => {
    // Update immediately on mount
    updateNextPrayer();

    // Schedule updates exactly when the next salat starts
    scheduleNextUpdate();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scheduleNextUpdate, updateNextPrayer]);

  // Safety: keep next salat fresh even if timers pause/resume
  useEffect(() => {
    const interval = setInterval(() => {
      updateNextPrayer();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateNextPrayer]);

  if (!nextPrayer) {
    return null;
  }

  const jamaahTime = nextPrayer.jamaah || nextPrayer.start;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('salatTimes.next')}
              </p>
              <h3 className="text-lg font-bold uppercase">{nextPrayer.name}</h3>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {t('salatTimes.start')}
              </p>
              <p className="text-lg font-bold">
                {formatTime(nextPrayer.start, timeFormat)}
              </p>
            </div>
            {nextPrayer.jamaah && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {t('salatTimes.jamaah')}
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatTime(jamaahTime, timeFormat)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
