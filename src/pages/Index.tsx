import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { DateTimeContainer } from '@/components/DateTimeContainer';
import { PrayerTimesContainer } from '@/components/PrayerTimesContainer';
import { ProhibitedTimesContainer } from '@/components/ProhibitedTimesContainer';
import { FastingTimesContainer } from '@/components/FastingTimesContainer';
import { fetchPrayerTimes } from '@/services/prayerTimesService';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PrayerTime, ProhibitedTime, UserSettings } from '@/types';
import { adjustTime, getProhibitedTimes } from '@/utils/timeUtils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Container IDs for drag and drop
enum ContainerType {
  DateTime = 'dateTime',
  PrayerTimes = 'prayerTimes',
  ProhibitedTimes = 'prohibitedTimes',
  FastingTimes = 'fastingTimes'
}

// Default settings - Updated to match Settings.tsx
const DEFAULT_SETTINGS: UserSettings = {
  method: 1, // University of Islamic Sciences Karachi
  madhab: 1, // Hanafi
  jamaahTimes: {},
  sehriAdjustment: 0,
  iftarAdjustment: 0,
  hijriAdjustment: 0,
  manualLocation: true, // Always use manual location
  country: 'Bangladesh',
  city: 'Dhaka'
};

// Default container order
const DEFAULT_CONTAINER_ORDER = [
  ContainerType.DateTime,
  ContainerType.PrayerTimes,
  ContainerType.ProhibitedTimes,
  ContainerType.FastingTimes
];

// Sortable container wrapper
function SortableContainer({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="relative mb-4">
      <div 
        className="absolute -left-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-6 h-12 cursor-grab touch-none"
        {...attributes} 
        {...listeners}
      >
        <GripVertical size={18} className="text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

const Index = () => {
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [containerOrder, setContainerOrder] = useLocalStorage<string[]>('muajjin-container-order', DEFAULT_CONTAINER_ORDER);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [prohibitedTimes, setProhibitedTimes] = useState<ProhibitedTime[]>([]);
  const [sehriTime, setSehriTime] = useState<string>('');
  const [iftarTime, setIftarTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = containerOrder.indexOf(active.id);
      const newIndex = containerOrder.indexOf(over.id);
      
      const newOrder = [...containerOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id);
      
      setContainerOrder(newOrder);
    }
  };
  
  // Load prayer times on component mount and when settings change
  useEffect(() => {
    loadPrayerTimes(userSettings);
  }, []);
  
  const loadPrayerTimes = async (settings: UserSettings) => {
    setIsLoading(true);
    try {
      const response = await fetchPrayerTimes(new Date(), settings);
      const timings = response.data.timings;
      
      // Create prayer times array with jamaah times from settings
      const prayers: PrayerTime[] = [
        { name: 'Fajr', start: timings.Fajr, end: timings.Sunrise, jamaah: settings.jamaahTimes.Fajr },
        { name: 'Dhuhr', start: timings.Dhuhr, end: timings.Asr, jamaah: settings.jamaahTimes.Dhuhr },
        { name: 'Asr', start: timings.Asr, end: timings.Maghrib, jamaah: settings.jamaahTimes.Asr },
        { name: 'Maghrib', start: timings.Maghrib, end: timings.Isha, jamaah: settings.jamaahTimes.Maghrib },
        { name: 'Isha', start: timings.Isha, end: timings.Fajr, jamaah: settings.jamaahTimes.Isha }
      ];
      
      setPrayerTimes(prayers);
      
      // Set prohibited times
      setProhibitedTimes(getProhibitedTimes(timings));
      
      // Set fasting times with adjustments
      setSehriTime(adjustTime(timings.Fajr, settings.sehriAdjustment));
      setIftarTime(adjustTime(timings.Maghrib, settings.iftarAdjustment));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading prayer times:', error);
      toast({
        title: "Error",
        description: "Failed to load prayer times. Please check your settings.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Render containers based on user order
  const renderContainers = () => {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={containerOrder} strategy={verticalListSortingStrategy}>
          {containerOrder.map(containerId => {
            let containerContent;
            
            switch (containerId) {
              case ContainerType.DateTime:
                containerContent = (
                  <DateTimeContainer
                    hijriAdjustment={userSettings.hijriAdjustment}
                    allPrayers={prayerTimes}
                    location={{
                      city: userSettings.city || 'Dhaka',
                      country: userSettings.country || 'Bangladesh'
                    }}
                  />
                );
                break;
              case ContainerType.PrayerTimes:
                containerContent = <PrayerTimesContainer prayers={prayerTimes} />;
                break;
              case ContainerType.ProhibitedTimes:
                containerContent = <ProhibitedTimesContainer prohibitedTimes={prohibitedTimes} />;
                break;
              case ContainerType.FastingTimes:
                containerContent = (
                  <FastingTimesContainer
                    sehriTime={sehriTime}
                    iftarTime={iftarTime}
                    sehriAdjustment={userSettings.sehriAdjustment}
                    iftarAdjustment={userSettings.iftarAdjustment}
                  />
                );
                break;
              default:
                return null;
            }
            
            return (
              <SortableContainer key={containerId} id={containerId}>
                {containerContent}
              </SortableContainer>
            );
          })}
        </SortableContext>
      </DndContext>
    );
  };
  
  return (
    <div className="min-h-screen p-4 max-w-md mx-auto pb-20">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary"></div>
            <div className="h-4 w-32 bg-secondary rounded"></div>
            <div className="h-3 w-24 bg-secondary rounded"></div>
          </div>
        </div>
      ) : (
        renderContainers()
      )}
    </div>
  );
};

export default Index;
