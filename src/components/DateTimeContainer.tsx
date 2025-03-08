
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatGregorianDate, formatHijriDate, getCurrentTimeFormatted } from '@/utils/timeUtils';
import { fetchHijriDate } from '@/services/prayerTimesService';
import { PrayerTime } from '@/types';
import { getCurrentPrayer, getNextPrayer, formatTime } from '@/utils/timeUtils';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';

interface DateTimeContainerProps {
  hijriAdjustment: number;
  allPrayers: PrayerTime[];
  location?: {
    city: string;
    country: string;
  };
}

export function DateTimeContainer({ hijriAdjustment, allPrayers, location }: DateTimeContainerProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeFormatted(true)); // Pass true to get 12-hour format
  const [hijriDate, setHijriDate] = useState<any>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeFormatted(true)); // Pass true to get 12-hour format
      
      // Update current and next prayer
      if (allPrayers.length > 0) {
        setCurrentPrayer(getCurrentPrayer(allPrayers));
        setNextPrayer(getNextPrayer(allPrayers));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [allPrayers]);
  
  // Fetch Hijri date on component mount
  useEffect(() => {
    const fetchHijri = async () => {
      try {
        const hijriData = await fetchHijriDate(new Date(), hijriAdjustment);
        setHijriDate(hijriData);
      } catch (error) {
        console.error('Error fetching Hijri date:', error);
      }
    };
    
    fetchHijri();
  }, [hijriAdjustment]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 prayer-container">
      <Card className="bg-secondary/50 shadow-none border-none">
        <CardContent className="p-4 text-left">
          {location && (
            <div className="mb-2 flex items-center">
              <MapPin size={14} className="mr-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{location.city}, {location.country}</p>
            </div>
          )}
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Hijri Date</p>
            <p className="text-xl font-semibold">{formatHijriDate(hijriDate)}</p>
          </div>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Gregorian Date</p>
            <p className="text-base">{formatGregorianDate(new Date())}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Time</p>
            <p className="text-2xl font-bold text-primary">{currentTime}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/50 shadow-none border-none">
        <CardContent className="p-4 text-left">
          {currentPrayer ? (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">Current Prayer</p>
              <p className="text-xl font-bold text-primary">{currentPrayer.name}</p>
              <p className="text-sm">
                Ends at{' '}
                <span className="font-medium">
                  {currentPrayer.end ? formatTime(currentPrayer.end) : 'N/A'}
                </span>
              </p>
              {currentPrayer.jamaah && (
                <p className="text-sm">
                  Jama'ah at{' '}
                  <span className="font-medium text-primary">
                    {formatTime(currentPrayer.jamaah)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">Current Prayer</p>
              <p className="text-lg">Loading...</p>
            </div>
          )}
          
          <Separator className="my-2" />
          
          {nextPrayer ? (
            <div>
              <p className="text-xs text-muted-foreground">Next Prayer</p>
              <p className="text-xl font-bold">{nextPrayer.name}</p>
              <p className="text-sm">
                Starts at{' '}
                <span className="font-medium">
                  {formatTime(nextPrayer.start)}
                </span>
              </p>
              {nextPrayer.jamaah && (
                <p className="text-sm">
                  Jama'ah at{' '}
                  <span className="font-medium text-primary">
                    {formatTime(nextPrayer.jamaah)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground">Next Prayer</p>
              <p className="text-lg">Loading...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
