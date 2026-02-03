import { PrayerTime } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';
import { getCurrentSalat } from '@/utils/timeUtils';
import { useCallback, useEffect, useState } from 'react';

interface PrayerTimesContainerProps {
  salats: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function PrayerTimesContainer({ salats, timeFormat = 'system' }: PrayerTimesContainerProps) {
  const { t } = useTranslation();
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);

  const isSamePrayer = (a: PrayerTime | null, b: PrayerTime | null) => {
    if (!a || !b) return a === b;
    return (
      a.id === b.id &&
      a.start === b.start &&
      a.end === b.end &&
      a.jamaah === b.jamaah
    );
  };

  const updateCurrentPrayer = useCallback(() => {
    if (salats.length === 0) return;
    const nextCurrent = getCurrentSalat(salats);
    setCurrentPrayer((prev) =>
      isSamePrayer(prev, nextCurrent) ? prev : nextCurrent,
    );
  }, [salats]);

  useEffect(() => {
    updateCurrentPrayer();
    const timer = setInterval(updateCurrentPrayer, 1000);
    return () => clearInterval(timer);
  }, [updateCurrentPrayer]);

  return (
    <Card className="overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <div className="text-left pl-2">{t('salatTimes.salat')}</div>
        <div className="text-center">{t('salatTimes.start')}</div>
        <div className="text-center">{t('salatTimes.jamaah')}</div>
        <div className="text-center">{t('salatTimes.end')}</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border">
        {salats.map((salat) => {
          const isCurrent = currentPrayer?.id === salat.id;
          const jamaahTime = salat.jamaah || salat.start;
          return (
            <div
              key={salat.name}
              className={`grid grid-cols-4 gap-2 p-3 ${
                isCurrent ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}>
              <div className={`text-left font-bold ${isCurrent ? 'text-primary' : ''}`}>
                {salat.name}
              </div>
              <div className={`text-center ${isCurrent ? 'font-medium' : ''}`}>
                {formatTime(salat.start, timeFormat)}
              </div>
              <div className="text-center text-primary font-semibold">
                {salat.jamaah ? formatTime(jamaahTime, timeFormat) : '—'}
              </div>
              <div className="text-center">
                {salat.end ? formatTime(salat.end, timeFormat) : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
