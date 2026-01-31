
import { PrayerTime } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';

interface PrayerTimesContainerProps {
  salats: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

// Helper to get Jama'ah time with fallback to start time
const getJamaahTime = (salat: PrayerTime): string => {
  return salat.jamaah || salat.start;
};

export function PrayerTimesContainer({ salats, timeFormat = 'system' }: PrayerTimesContainerProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-2xl font-bold">
          {t('salatTimes.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-2 pb-2 mb-2 border-b border-secondary">
          <div className="text-sm font-semibold">{t('salatTimes.salat')}</div>
          <div className="text-sm font-semibold text-center">{t('salatTimes.start')}</div>
          <div className="text-sm font-semibold text-center">{t('salatTimes.jamaah')}</div>
          <div className="text-sm font-semibold text-center">{t('salatTimes.end')}</div>
        </div>

        {/* Table Rows */}
        {salats.map((salat) => (
          <div key={salat.name} className="grid grid-cols-4 gap-2 py-3 border-b border-secondary last:border-0 items-center">
            <div className="font-medium">{salat.name}</div>
            <div className="text-center text-sm">{formatTime(salat.start, timeFormat)}</div>
            <div className="text-center text-sm text-primary font-medium">
              {formatTime(getJamaahTime(salat), timeFormat)}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {salat.end ? formatTime(salat.end, timeFormat) : '—'}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
