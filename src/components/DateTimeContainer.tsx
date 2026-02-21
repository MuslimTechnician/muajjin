import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  formatGregorianDateShort,
  getCurrentTimeFormatted,
} from '@/utils/timeUtils';
import {
  calculateHijriDate,
  formatHijriDateLocal,
  HijriDateResult,
} from '@/utils/hijriUtils';
import { MapPin } from 'lucide-react';

interface DateTimeContainerProps {
  hijriAdjustment: number;
  hijriDateChangeAtMaghrib: boolean;
  maghribTime?: string;
  location?: {
    city: string;
    country: string;
  };
  timeFormat?: 'system' | '12h' | '24h';
}

export function DateTimeContainer({
  hijriAdjustment,
  hijriDateChangeAtMaghrib,
  maghribTime,
  location,
  timeFormat = 'system',
}: DateTimeContainerProps) {
  const [currentTime, setCurrentTime] = useState(
    getCurrentTimeFormatted(timeFormat),
  );
  const [hijriDate, setHijriDate] = useState<HijriDateResult | null>(null);
  const [lastCalculatedDate, setLastCalculatedDate] = useState<string>('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeFormatted(timeFormat));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeFormat]);

  // Calculate Hijri date locally on component mount, adjustment change, and date change
  useEffect(() => {
    const updateHijriDate = () => {
      const today = new Date().toDateString();
      if (lastCalculatedDate !== today) {
        // Calculate Hijri date locally using Umm al-Qura calendar (no API call needed!)
        const hijri = calculateHijriDate(
          new Date(),
          hijriAdjustment,
          maghribTime,
          hijriDateChangeAtMaghrib,
        );
        setHijriDate(hijri);
        setLastCalculatedDate(today);
      }
    };

    // Update immediately on mount
    updateHijriDate();

    // Check every minute for date change
    const timer = setInterval(updateHijriDate, 60000);

    return () => clearInterval(timer);
  }, [
    hijriAdjustment,
    hijriDateChangeAtMaghrib,
    maghribTime,
    lastCalculatedDate,
  ]);

  return (
    <div className="space-y-3 text-center">
      {/* Large Clock Time */}
      <div className="text-5xl font-bold tracking-tighter text-primary">
        {currentTime.split(':').slice(0, 2).join(':')}
      </div>

      {/* Date Row */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>{formatGregorianDateShort(new Date())}</span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
        <span>{formatHijriDateLocal(hijriDate)}</span>
      </div>

      {/* Location Badge */}
      {location && (
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <MapPin className="h-3 w-3" />
          {location.city}
        </div>
      )}
    </div>
  );
}
