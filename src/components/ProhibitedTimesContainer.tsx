
import { ProhibitedTime } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';

interface ProhibitedTimesContainerProps {
  prohibitedTimes: ProhibitedTime[];
  timeFormat?: 'system' | '12h' | '24h';
}

export function ProhibitedTimesContainer({ prohibitedTimes, timeFormat = 'system' }: ProhibitedTimesContainerProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-2xl font-bold">
          {t('prohibited.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
          <div className="grid gap-3">
            {prohibitedTimes.map((time) => (
              <div key={time.name} className="flex justify-between items-center border-b border-secondary pb-2 last:border-0 last:pb-0">
                <p className="font-medium">{time.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(time.start, timeFormat)} → {formatTime(time.end, timeFormat)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
}
