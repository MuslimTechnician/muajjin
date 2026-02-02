import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrayerTime } from '@/types';
import { formatTime, getNextSalat } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';
import { ChevronRight } from 'lucide-react';

interface NextPrayerContainerProps {
  allPrayers: PrayerTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

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
    return null;
  }

  const jamaahTime = nextPrayer.jamaah || nextPrayer.start;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('salatTimes.next')}</p>
              <h3 className="text-lg font-bold uppercase">{nextPrayer.name}</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t('salatTimes.start')}</p>
              <p className="text-lg font-bold">
                {formatTime(nextPrayer.start, timeFormat)}
              </p>
            </div>
            {nextPrayer.jamaah && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t('salatTimes.jamaah')}</p>
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
