import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { ProhibitedTime } from '@/types';
import { formatTime } from '@/utils/timeUtils';
import { AlertTriangle, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProhibitedTimesContainerProps {
  prohibitedTimes: ProhibitedTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function ProhibitedTimesContainer({
  prohibitedTimes,
  timeFormat = 'system',
}: ProhibitedTimesContainerProps) {
  const { t } = useTranslation();
  const [now, setNow] = useState<Date>(new Date());

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const isTimeInRange = (current: Date, start: string, end: string) => {
    const currentMinutes = current.getHours() * 60 + current.getMinutes();
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (endMinutes < startMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold">{t('prohibited.title')}</h3>
        </div>
        <div className="space-y-2">
          {prohibitedTimes.map((time) => {
            const isCurrent = isTimeInRange(now, time.start, time.end);
            return (
              <div
                key={time.name}
                className={[
                  'flex items-center justify-between rounded-lg border p-3 transition-colors',
                  isCurrent
                    ? 'animate-pulse border-red-500/60 bg-red-500/10'
                    : 'border-border bg-muted/20',
                ].join(' ')}>
                <div className="flex items-center gap-2">
                  <Sun
                    className={[
                      'h-4 w-4',
                      isCurrent ? 'text-red-500' : 'text-orange-500',
                    ].join(' ')}
                  />
                  <span
                    className={[
                      'text-sm font-semibold',
                      isCurrent ? 'text-red-600' : '',
                    ].join(' ')}>
                    {time.name}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {formatTime(time.start, timeFormat)} →{' '}
                  {formatTime(time.end, timeFormat)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
