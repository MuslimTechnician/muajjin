
import { PrayerTime, ProhibitedTime } from "@/types";

// Format time from 24h format to 12h format with AM/PM
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hoursNum = parseInt(hours, 10);
  const ampm = hoursNum >= 12 ? 'PM' : 'AM';
  const hours12 = hoursNum % 12 || 12;
  return `${hours12}:${minutes} ${ampm}`;
}

// Calculate end time of a prayer based on the start time of the next prayer
export function calculatePrayerEndTime(currentPrayerStart: string, nextPrayerStart: string): string {
  return nextPrayerStart;
}

// Adjust time by adding or subtracting minutes
export function adjustTime(time: string, minutesAdjustment: number): string {
  const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  // Add or subtract minutes
  date.setMinutes(date.getMinutes() + minutesAdjustment);
  
  const adjustedHours = String(date.getHours()).padStart(2, '0');
  const adjustedMinutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${adjustedHours}:${adjustedMinutes}`;
}

// Get the current prayer based on current time
export function getCurrentPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeString = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
  
  for (let i = 0; i < prayerTimes.length; i++) {
    const currentPrayer = prayerTimes[i];
    const nextPrayer = prayerTimes[i + 1] || prayerTimes[0]; // Loop back to the first prayer if we're at the end
    
    const [startHours, startMinutes] = currentPrayer.start.split(':').map(Number);
    const [endHours, endMinutes] = (currentPrayer.end || nextPrayer.start).split(':').map(Number);
    
    // Convert to minutes for easier comparison
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    // Handle day wraparound for Isha
    if (currentPrayer.name === 'Isha' && endTotalMinutes < startTotalMinutes) {
      if (currentTotalMinutes >= startTotalMinutes || currentTotalMinutes < endTotalMinutes) {
        return currentPrayer;
      }
    } else if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes) {
      return currentPrayer;
    }
  }
  
  return null;
}

// Get the next prayer based on current time
export function getNextPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  // Sort prayers by start time
  const sortedPrayers = [...prayerTimes].sort((a, b) => {
    const [aHours, aMinutes] = a.start.split(':').map(Number);
    const [bHours, bMinutes] = b.start.split(':').map(Number);
    
    const aTotalMinutes = aHours * 60 + aMinutes;
    const bTotalMinutes = bHours * 60 + bMinutes;
    
    return aTotalMinutes - bTotalMinutes;
  });
  
  // Find the next prayer
  for (const prayer of sortedPrayers) {
    const [hours, minutes] = prayer.start.split(':').map(Number);
    const prayerTotalMinutes = hours * 60 + minutes;
    
    if (prayerTotalMinutes > currentTotalMinutes) {
      return prayer;
    }
  }
  
  // If no next prayer found today, return the first prayer of the day
  return sortedPrayers[0];
}

// Get prohibited prayer times
export function getProhibitedTimes(prayerTimes: { [key: string]: string }): ProhibitedTime[] {
  const prohibitedTimes: ProhibitedTime[] = [
    {
      name: 'Sunrise',
      time: prayerTimes['Sunrise'],
      description: 'From dawn until the sun has risen'
    },
    {
      name: 'Zenith',
      time: adjustTime(prayerTimes['Dhuhr'], -5),
      description: 'When the sun is at its highest point (5 minutes before Dhuhr)'
    },
    {
      name: 'Sunset',
      time: adjustTime(prayerTimes['Maghrib'], -5),
      description: 'When the sun is about to set (5 minutes before Maghrib)'
    }
  ];
  
  return prohibitedTimes;
}

// Format current time
export function getCurrentTimeFormatted(use12Hour: boolean = false): string {
  const now = new Date();
  
  if (use12Hour) {
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  } else {
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }
}

// Format Gregorian date
export function formatGregorianDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Format Hijri date
export function formatHijriDate(hijriData: any): string {
  if (!hijriData || !hijriData.data || !hijriData.data.hijri) {
    return 'Loading Hijri date...';
  }
  
  const hijri = hijriData.data.hijri;
  return `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
}
