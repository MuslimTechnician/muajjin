
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatGregorianDateShort, getCurrentTimeFormatted, getDayName, resolveTimeFormat } from '@/utils/timeUtils';
import { calculateHijriDate, formatHijriDateLocal, HijriDateResult } from '@/utils/hijriUtils';
import { MapPin } from 'lucide-react';

interface DateTimeContainerProps {
  hijriAdjustment: number;
  location?: {
    city: string;
    country: string;
  };
  timeFormat?: 'system' | '12h' | '24h';
}

export function DateTimeContainer({ hijriAdjustment, location, timeFormat = 'system' }: DateTimeContainerProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeFormatted(timeFormat));
  const [hijriDate, setHijriDate] = useState<HijriDateResult | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeFormatted(timeFormat));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeFormat]);

  // Calculate Hijri date locally on component mount and adjustment change
  useEffect(() => {
    // Calculate Hijri date locally using Umm al-Qura calendar (no API call needed!)
    const hijri = calculateHijriDate(new Date(), hijriAdjustment);
    setHijriDate(hijri);
  }, [hijriAdjustment]);
  
  return (
    <Card className="bg-muted/30 border shadow-sm mb-4 rounded-sm">
      <CardContent className="p-4">
          <div className="space-y-3">
            {/* Row 1: Time + Day Name | Location */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column: Time + Day Name (same row) */}
              <div className="text-left flex items-baseline gap-2">
                <span className="text-base">
                  {resolveTimeFormat(timeFormat) === '24h'
                    ? currentTime.split(':').slice(0, 2).join(':')
                    : currentTime.split(':').slice(0, 2).join(':') + ' ' + currentTime.split(' ').slice(-1)[0]
                  }
                </span>
                <span className="text-base">{getDayName(new Date())}</span>
              </div>

              {/* Right Column: Location */}
              <div className="text-right flex items-center justify-end gap-2">
                {location && (
                  <>
                    <span className="text-base">{location.city}</span>
                    <MapPin size={14} className="text-muted-foreground" />
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Hijri Date | Gregorian Date */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column: Hijri Date */}
              <div className="text-left">
                <p className="text-base">{formatHijriDateLocal(hijriDate)}</p>
              </div>

              {/* Right Column: Gregorian Date */}
              <div className="text-right">
                <p className="text-base text-muted-foreground">{formatGregorianDateShort(new Date())}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
