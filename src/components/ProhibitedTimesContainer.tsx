import { ProhibitedTime } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';
import { AlertTriangle, Sun } from 'lucide-react';

interface ProhibitedTimesContainerProps {
  prohibitedTimes: ProhibitedTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function ProhibitedTimesContainer({ prohibitedTimes, timeFormat = 'system' }: ProhibitedTimesContainerProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold">{t('prohibited.title')}</h3>
        </div>
        <div className="space-y-2">
          {prohibitedTimes.map((time) => (
            <div
              key={time.name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">{time.name}</span>
              </div>
              <span className="text-sm font-bold">
                {formatTime(time.start, timeFormat)} → {formatTime(time.end, timeFormat)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
