import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { PrayerTime } from '@/types';
import { formatTime, getCurrentSalat } from '@/utils/timeUtils';
import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PrayerTimesContainerProps {
  salats: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function PrayerTimesContainer({
  salats,
  timeFormat = 'system',
}: PrayerTimesContainerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    <div>
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-2 bg-muted/30 p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="pl-2 text-left">{t('salatTimes.salat')}</div>
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
                  isCurrent && 'border-l-4 border-l-primary bg-primary/5'
                }`}>
                <p
                  className={`text-left font-bold ${isCurrent && 'text-primary'}`}>
                  {salat.name}
                </p>

                <p className={`text-center ${isCurrent && 'font-medium'}`}>
                  {formatTime(salat.start, timeFormat)}
                </p>

                <p className="text-center font-semibold text-primary">
                  {salat.jamaah ? formatTime(jamaahTime, timeFormat) : '—'}
                </p>

                <p className="text-center">
                  {salat.end ? formatTime(salat.end, timeFormat) : '—'}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center border-t border-border bg-muted/20 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-primary/10 px-3 font-semibold text-primary hover:bg-primary/20"
            onClick={() => navigate('/upcoming-prayer-times')}>
            {t('salatTimes.upcomingTitle')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
