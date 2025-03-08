
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { Utensils, Clock } from 'lucide-react';

interface FastingTimesContainerProps {
  sehriTime: string;
  iftarTime: string;
  sehriAdjustment: number;
  iftarAdjustment: number;
}

export function FastingTimesContainer({
  sehriTime,
  iftarTime,
  sehriAdjustment,
  iftarAdjustment
}: FastingTimesContainerProps) {
  const [countdown, setCountdown] = useState<string>('');
  const [nextEventName, setNextEventName] = useState<string>('');
  
  // Function to calculate time difference in hours, minutes, seconds
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
      
      // Convert sehri and iftar times to comparable values
      const [sehriHours, sehriMinutes] = sehriTime.split(':').map(Number);
      const [iftarHours, iftarMinutes] = iftarTime.split(':').map(Number);
      
      const currentTotal = currentHours * 60 + currentMinutes;
      const sehriTotal = sehriHours * 60 + sehriMinutes;
      const iftarTotal = iftarHours * 60 + iftarMinutes;
      
      // Determine which event is next
      let targetTime: string;
      let eventName: string;
      
      if (currentTotal < sehriTotal) {
        // Before Sehri
        targetTime = sehriTime;
        eventName = 'Sehri Ends in';
      } else if (currentTotal < iftarTotal) {
        // After Sehri, before Iftar
        targetTime = iftarTime;
        eventName = 'Iftar Starts in';
      } else {
        // After Iftar, next is tomorrow's Sehri
        targetTime = sehriTime;
        eventName = 'Sehri Ends in';
      }
      
      const difference = calculateTimeDifference(targetTime);
      
      if (difference) {
        const { hours, minutes, seconds } = difference;
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        setNextEventName(eventName);
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
    <div className="prayer-container">
      <Card className="bg-transparent shadow-none border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Utensils size={18} />
            Fasting Times
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-secondary rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Sehri Ends</p>
              <p className="text-2xl font-bold">{formatTime(sehriTime)}</p>
              {sehriAdjustment !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Adjusted by {sehriAdjustment > 0 ? '+' : ''}{sehriAdjustment} min
                </p>
              )}
            </div>
            
            <div className="border border-secondary rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Iftar Starts</p>
              <p className="text-2xl font-bold text-primary">{formatTime(iftarTime)}</p>
              {iftarAdjustment !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Adjusted by {iftarAdjustment > 0 ? '+' : ''}{iftarAdjustment} min
                </p>
              )}
            </div>
          </div>
          
          {/* Countdown Section */}
          <div className="mt-4 border border-secondary rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={18} />
              <p className="text-muted-foreground">{nextEventName}</p>
            </div>
            <p className="text-3xl font-bold text-primary">{countdown}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
