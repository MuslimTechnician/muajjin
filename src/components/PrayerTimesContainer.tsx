
import { PrayerTime } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { Bell } from 'lucide-react';

interface PrayerTimesContainerProps {
  prayers: PrayerTime[];
}

export function PrayerTimesContainer({ prayers }: PrayerTimesContainerProps) {
  return (
    <div className="prayer-container">
      <Card className="bg-transparent shadow-none border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Bell size={18} />
            Prayer Times
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {prayers.map((prayer) => (
            <div key={prayer.name} className="prayer-time border-b border-secondary last:border-0">
              <div className="text-left">
                <p className="font-semibold">{prayer.name}</p>
              </div>
              
              <div className="flex gap-3 text-right">
                <div className="text-xs lg:text-sm">
                  <p className="text-muted-foreground">Start</p>
                  <p>{formatTime(prayer.start)}</p>
                </div>
                
                {prayer.end && (
                  <div className="text-xs lg:text-sm">
                    <p className="text-muted-foreground">End</p>
                    <p>{formatTime(prayer.end)}</p>
                  </div>
                )}
                
                {prayer.jamaah && (
                  <div className="text-xs lg:text-sm">
                    <p className="text-muted-foreground">Jama'ah</p>
                    <p className="text-primary font-medium">{formatTime(prayer.jamaah)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
