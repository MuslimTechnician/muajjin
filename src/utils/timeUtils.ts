
import { PrayerTime, ProhibitedTime } from "@/types";

// Cache for translation function to avoid circular imports
let translationFunction: ((key: string) => string) | null = null;

export function setTranslationFunction(fn: (key: string) => string) {
  translationFunction = fn;
}

function t(key: string): string {
  return translationFunction ? translationFunction(key) : key;
}

/**
 * Detect if the user's system uses 12-hour or 24-hour time format
 * Uses Intl.DateTimeFormat to check the system preference
 */
export function getSystemTimeFormat(): '12h' | '24h' {
  try {
    // Use a test time (13:00 = 1 PM) to check if system shows 12h or 24h
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false // Let the system decide
    });

    const parts = formatter.formatToParts(new Date(2021, 0, 1, 13));
    const hasDayPeriod = parts.some(part => part.type === 'dayPeriod');

    // If the formatter doesn't use dayPeriod for 13:00, it's 24h format
    // But we need to check if hour12 is actually being used
    const formatterWith12h = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      hour12: true
    });
    const formattedWith12h = formatterWith12h.format(new Date(2021, 0, 1, 13));

    // If system shows "1 PM" or similar, it's 12h format
    // If system shows "13", it's 24h format
    const formatterAuto = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      hour12: true
    });
    const formattedAuto = formatterAuto.format(new Date(2021, 0, 1, 13));

    // Check if the result contains PM/AM indicator
    if (formattedAuto.includes('PM') || formattedAuto.includes('AM')) {
      return '12h';
    }

    // Check if the hour is shown as 13 (24h) or 1 (12h)
    const hourPart = parts.find(p => p.type === 'hour');
    if (hourPart && hourPart.value === '13') {
      return '24h';
    }

    // Fallback: try formatting and check for day period
    const testFormatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: 'numeric'
    });
    const testFormatted = testFormatter.format(new Date(2021, 0, 1, 13));

    // If it contains AM/PM, it's 12h
    if (testFormatted.includes('AM') || testFormatted.includes('PM')) {
      return '12h';
    }

    // Default to 24h if unable to detect
    return '24h';
  } catch {
    // If detection fails, default to 24h
    return '24h';
  }
}

/**
 * Resolve the actual time format ('12h' or '24h') from user preference
 * If user selected 'system', detect system preference
 */
export function resolveTimeFormat(format: 'system' | '12h' | '24h'): '12h' | '24h' {
  if (format === 'system') {
    return getSystemTimeFormat();
  }
  return format;
}

// Format time from 24h format to 12h or 24h format based on preference
export function formatTime(time: string, format: 'system' | '12h' | '24h' = 'system'): string {
  const [hours, minutes] = time.split(':');
  const hoursNum = parseInt(hours, 10);

  // Resolve the actual format (handle 'system' option)
  const actualFormat = resolveTimeFormat(format);

  if (actualFormat === '24h') {
    return `${String(hoursNum).padStart(2, '0')}:${minutes}`;
  }

  // 12h format with AM/PM
  const ampm = hoursNum >= 12 ? t('common.pm') : t('common.am');
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

// Get prohibited prayer times with start and end ranges
export function getProhibitedTimes(prayerTimes: { [key: string]: string }): ProhibitedTime[] {
  const prohibitedTimes: ProhibitedTime[] = [
    {
      name: t('prohibited.sunrise'),
      start: prayerTimes['Sunrise'], // When Fajr ends
      end: adjustTime(prayerTimes['Sunrise'], 15) // 15 minutes after sunrise
    },
    {
      name: t('prohibited.zenith'),
      start: adjustTime(prayerTimes['Dhuhr'], -3), // 3 minutes before Dhuhr
      end: prayerTimes['Dhuhr'] // Until Dhuhr starts
    },
    {
      name: t('prohibited.sunset'),
      start: adjustTime(prayerTimes['Maghrib'], -15), // 15 minutes before Maghrib
      end: prayerTimes['Maghrib'] // Until Maghrib starts
    }
  ];

  return prohibitedTimes;
}

// Format current time
export function getCurrentTimeFormatted(format: 'system' | '12h' | '24h' = 'system'): string {
  const now = new Date();

  // Resolve the actual format (handle 'system' option)
  const actualFormat = resolveTimeFormat(format);

  if (actualFormat === '12h') {
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? t('common.pm') : t('common.am');

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

// Get day name only (e.g., "Mon")
export function getDayName(date: Date, short: boolean = true): string {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: short ? 'short' : 'long'
  }).format(date);
  return weekday;
}

// Format Gregorian date without day name (e.g., "12 Aug 2026")
export function formatGregorianDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
