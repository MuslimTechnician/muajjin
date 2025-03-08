
import { ProhibitedTime } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/utils/timeUtils';
import { Ban } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProhibitedTimesContainerProps {
  prohibitedTimes: ProhibitedTime[];
}

export function ProhibitedTimesContainer({ prohibitedTimes }: ProhibitedTimesContainerProps) {
  return (
    <div className="prayer-container">
      <Card className="bg-transparent shadow-none border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Ban size={18} className="text-destructive" />
            Prohibited Prayer Times
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3">
            {prohibitedTimes.map((time) => (
              <TooltipProvider key={time.name}>
                <div className="flex justify-between items-center border-b border-secondary pb-2 last:border-0 last:pb-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <p className="font-medium">{time.name}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-[200px] text-sm">{time.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <p>{formatTime(time.time)}</p>
                </div>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
