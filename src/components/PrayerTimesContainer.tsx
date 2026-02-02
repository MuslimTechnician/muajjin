import { PrayerTime } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';
import { getCurrentSalat } from '@/utils/timeUtils';

interface PrayerTimesContainerProps {
  salats: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function PrayerTimesContainer({ salats, timeFormat = 'system' }: PrayerTimesContainerProps) {
  const { t } = useTranslation();
  const currentPrayer = getCurrentSalat(salats);

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
