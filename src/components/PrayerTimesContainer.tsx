
import { PrayerTime } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';

interface PrayerTimesContainerProps {
  prayers: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

// Helper to get Jama'ah time with fallback to start time
const getJamaahTime = (prayer: PrayerTime): string => {
  return prayer.jamaah || prayer.start;
};

export function PrayerTimesContainer({ prayers, timeFormat = 'system' }: PrayerTimesContainerProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-2xl font-bold">
          {t('prayerTimes.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-2 pb-2 mb-2 border-b border-secondary">
          <div className="text-sm font-semibold">{t('prayerTimes.prayer')}</div>
          <div className="text-sm font-semibold text-center">{t('prayerTimes.start')}</div>
          <div className="text-sm font-semibold text-center">{t('prayerTimes.jamaah')}</div>
          <div className="text-sm font-semibold text-center">{t('prayerTimes.end')}</div>
        </div>

        {/* Table Rows */}
        {prayers.map((prayer) => (
          <div key={prayer.name} className="grid grid-cols-4 gap-2 py-3 border-b border-secondary last:border-0 items-center">
            <div className="font-medium">{prayer.name}</div>
            <div className="text-center text-sm">{formatTime(prayer.start, timeFormat)}</div>
            <div className="text-center text-sm text-primary font-medium">
              {formatTime(getJamaahTime(prayer), timeFormat)}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {prayer.end ? formatTime(prayer.end, timeFormat) : '—'}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
