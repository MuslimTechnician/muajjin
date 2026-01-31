import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrayerTime } from '@/types';
import { formatTime } from '@/utils/timeUtils';
import { getNextSalat } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';

interface NextPrayerContainerProps {
  allPrayers: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

// Helper to get Jama'ah time with fallback to start time
const getJamaahTime = (salat: PrayerTime): string => {
  return salat.jamaah || salat.start;
};

export function NextPrayerContainer({ allPrayers, timeFormat = 'system' }: NextPrayerContainerProps) {
  const { t } = useTranslation();
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);

  // Recalculate next salat every 30 seconds and on mount
  useEffect(() => {
    const updateNextPrayer = () => {
      if (allPrayers.length > 0) {
        setNextPrayer(getNextSalat(allPrayers));
      }
    };

    // Update immediately on mount
    updateNextPrayer();

    // Update every 30 seconds to catch prayer transitions
    const timer = setInterval(updateNextPrayer, 30000);

    return () => clearInterval(timer);
  }, [allPrayers]);

  if (!nextPrayer) {
    return (
      <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
            {t('salatTimes.next')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-lg">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  const jamaahTime = getJamaahTime(nextPrayer);

  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
          {t('salatTimes.next')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Prayer Name */}
        <p className="text-2xl font-bold text-primary mb-3 text-center">{nextPrayer.name}</p>

        {/* Start | Jama'ah - Boxed Style */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-secondary rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">{t('salatTimes.start')}</p>
            <p className="text-2xl font-bold text-primary">{formatTime(nextPrayer.start, timeFormat)}</p>
          </div>

          <div className="border border-secondary rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">{t('salatTimes.jamaah')}</p>
            <p className="text-2xl font-bold">{formatTime(jamaahTime, timeFormat)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
