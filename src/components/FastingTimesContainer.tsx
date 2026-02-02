import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { useTranslation } from '@/contexts/TranslationContext';
import { MoonStar } from 'lucide-react';

interface FastingTimesContainerProps {
  suhoorTime: string;
  iftarTime: string;
  timeFormat?: 'system' | '12h' | '24h';
}

export function FastingTimesContainer({
  suhoorTime,
  iftarTime,
  timeFormat = 'system'
}: FastingTimesContainerProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<string>('');
  const [nextEventName, setNextEventName] = useState<string>('');

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
      const currentSeconds = now.getSeconds();

      // Times are already adjusted from Index.tsx, use them directly
      // Convert times to total seconds for precise comparison
      const [suhoorHours, suhoorMinutes] = suhoorTime.split(':').map(Number);
      const [iftarHours, iftarMinutes] = iftarTime.split(':').map(Number);

      const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
      const suhoorTotalSeconds = suhoorHours * 3600 + suhoorMinutes * 60;
      const iftarTotalSeconds = iftarHours * 3600 + iftarMinutes * 60;

      // Determine which event is next
      let targetTime: string;
      let eventName: string;

      if (currentTotalSeconds < suhoorTotalSeconds) {
        // Before Suhoor
        targetTime = suhoorTime;
        eventName = t('saum.suhoorEndsIn');
      } else if (currentTotalSeconds < iftarTotalSeconds) {
        // After Suhoor, before Iftar (saum/fasting time)
        targetTime = iftarTime;
        eventName = t('saum.iftarStartsIn');
      } else {
        // After Iftar, next is tomorrow's Suhoor
        targetTime = suhoorTime;
        eventName = t('saum.suhoorEndsIn');
      }

      const difference = calculateTimeDifference(targetTime);

      if (difference) {
        const { hours, minutes, seconds } = difference;
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        setNextEventName(eventName);
      } else {
        setCountdown('--:--:--');
        setNextEventName(t('common.loading'));
      }
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [suhoorTime, iftarTime, t]);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MoonStar className="w-5 h-5 text-primary" />
          <h3 className="font-bold">{t('saum.title')}</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground">{t('saum.suhoorEnds')}</p>
            <p className="text-lg font-bold">{formatTime(suhoorTime, timeFormat)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground">{t('saum.iftarStarts')}</p>
            <p className="text-lg font-bold">{formatTime(iftarTime, timeFormat)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-xs text-muted-foreground">{nextEventName || t('saum.nextMeal')}</p>
            <p className="text-lg font-bold text-primary font-mono">{countdown}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
