
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';

interface FastingTimesContainerProps {
  sehriTime: string;
  iftarTime: string;
  suhoorAdjustment: number;
  iftarAdjustment: number;
  timeFormat?: 'system' | '12h' | '24h';
}

export function FastingTimesContainer({
  sehriTime,
  iftarTime,
  suhoorAdjustment,
  iftarAdjustment,
  timeFormat = 'system'
}: FastingTimesContainerProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<string>('');
  const [nextEventName, setNextEventName] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Function to calculate time difference in hours, minutes, seconds for saum times
  const calculateTimeDifference = (targetTime: string): { hours: number; minutes: number; seconds: number } | null => {
    const now = new Date();
    const [targetHours, targetMinutes] = targetTime.split(':').map(Number);

    if (isNaN(targetHours) || isNaN(targetMinutes)) return null;

    const target = new Date();
    target.setHours(targetHours, targetMinutes, 0, 0);

    // If target time is earlier than current time, set target to tomorrow
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Convert suhoor and iftar times to comparable values
      const [sehriHours, sehriMinutes] = sehriTime.split(':').map(Number);
      const [iftarHours, iftarMinutes] = iftarTime.split(':').map(Number);

      const currentTotal = currentHours * 60 + currentMinutes;
      const sehriTotal = sehriHours * 60 + sehriMinutes;
      const iftarTotal = iftarHours * 60 + iftarMinutes;

      // Determine which event is next
      let targetTime: string;
      let eventName: string;
      let startTime: Date;
      let endTime: Date;

      if (currentTotal < sehriTotal) {
        // Before Suhoor
        targetTime = sehriTime;
        eventName = t('saum.suhoorEndsIn');
        // Progress from previous Iftar to Suhoor
        startTime = new Date();
        startTime.setHours(iftarHours, iftarMinutes, 0, 0);
        startTime.setDate(startTime.getDate() - 1);
        endTime = new Date();
        endTime.setHours(sehriHours, sehriMinutes, 0, 0);
      } else if (currentTotal < iftarTotal) {
        // After Suhoor, before Iftar (saum/fasting time)
        targetTime = iftarTime;
        eventName = t('saum.iftarStartsIn');
        // Progress from Suhoor to Iftar
        startTime = new Date();
        startTime.setHours(sehriHours, sehriMinutes, 0, 0);
        endTime = new Date();
        endTime.setHours(iftarHours, iftarMinutes, 0, 0);
      } else {
        // After Iftar, next is tomorrow's Suhoor
        targetTime = sehriTime;
        eventName = t('saum.suhoorEndsIn');
        // Progress from Iftar to tomorrow's Suhoor
        startTime = new Date();
        startTime.setHours(iftarHours, iftarMinutes, 0, 0);
        endTime = new Date();
        endTime.setHours(sehriHours, sehriMinutes, 0, 0);
        endTime.setDate(endTime.getDate() + 1);
      }

      const difference = calculateTimeDifference(targetTime);

      if (difference) {
        const { hours, minutes, seconds } = difference;
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        setNextEventName(eventName);

        // Calculate progress percentage
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsed = now.getTime() - startTime.getTime();
        const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        setProgressPercent(percent);
      } else {
        setCountdown('--:--:--');
        setNextEventName('Calculating...');
      }
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [sehriTime, iftarTime]);

  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-2xl font-bold">
          {t('saum.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-secondary rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">{t('saum.suhoorEnds')}</p>
              <p className="text-2xl font-bold">{formatTime(sehriTime, timeFormat)}</p>
              {suhoorAdjustment !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('saum.adjustedBy', { minutes: suhoorAdjustment > 0 ? `+${suhoorAdjustment}` : suhoorAdjustment })}
                </p>
              )}
            </div>

            <div className="border border-secondary rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">{t('saum.iftarStarts')}</p>
              <p className="text-2xl font-bold">{formatTime(iftarTime, timeFormat)}</p>
              {iftarAdjustment !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('saum.adjustedBy', { minutes: iftarAdjustment > 0 ? `+${iftarAdjustment}` : iftarAdjustment })}
                </p>
              )}
            </div>
          </div>

          {/* Countdown Section */}
          <div className="mt-4 border border-secondary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{nextEventName}</p>
            <p className="text-3xl font-bold text-primary font-mono mb-3">{countdown}</p>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
